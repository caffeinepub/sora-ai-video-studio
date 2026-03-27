import Auth "authorization/access-control";
import _Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

persistent actor {
  /// Access Control
  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  /// Persistent Blob Storage
  include MixinStorage();

  // ---- Types ----
  type UserProfile = {
    credits: Nat;
    role: Text;
    createdAt: Int;
    hasReceivedFreeCredits: Bool;
  };

  type VideoJob = {
    id: Text;
    owner: Principal;
    prompt: Text;
    imageUrl: ?Text;
    style: Text;
    durationSeconds: Nat;
    status: Text;
    createdAt: Int;
    title: Text;
    category: Text;
  };

  type UserWithPrincipal = {
    principal: Principal;
    profile: UserProfile;
  };

  type PlatformStats = {
    totalUsers: Nat;
    totalVideos: Nat;
    totalCreditsIssued: Nat;
  };

  // ---- Stable State (Map is stable) ----
  let users = Map.empty<Principal, UserProfile>();
  let videos = Map.empty<Text, VideoJob>();
  var videoCounter: Nat = 0;
  var totalCreditsIssued: Nat = 0;
  var adminBootstrapped: Bool = false;

  // ---- Helpers ----
  func creditCostForDuration(durationSeconds: Nat): Nat {
    if (durationSeconds <= 15) { 10 }
    else if (durationSeconds <= 30) { 20 }
    else if (durationSeconds <= 180) { 80 }
    else { 200 }
  };

  func ensureProfile(caller: Principal): UserProfile {
    switch (users.get(caller)) {
      case (?profile) { profile };
      case null {
        let role = if (not adminBootstrapped) {
          adminBootstrapped := true;
          "admin"
        } else { "user" };
        let profile: UserProfile = {
          credits = 300;
          role = role;
          createdAt = Time.now();
          hasReceivedFreeCredits = true;
        };
        users.add(caller, profile);
        totalCreditsIssued += 300;
        profile
      };
    }
  };

  // ---- User APIs ----
  public shared(msg) func getMyProfile(): async UserProfile {
    ensureProfile(msg.caller)
  };

  public shared(msg) func getMyCredits(): async Nat {
    let profile = ensureProfile(msg.caller);
    profile.credits
  };

  // ---- Video APIs ----
  public shared(msg) func createVideoJob(
    prompt: Text,
    imageUrl: ?Text,
    style: Text,
    durationSeconds: Nat,
    title: Text,
    category: Text
  ): async { #ok: Text; #err: Text } {
    let caller = msg.caller;
    let profile = ensureProfile(caller);
    let cost = creditCostForDuration(durationSeconds);
    if (profile.credits < cost) {
      return #err("Insufficient credits. Need " # cost.toText() # " but have " # profile.credits.toText());
    };
    let updated: UserProfile = {
      credits = profile.credits - cost;
      role = profile.role;
      createdAt = profile.createdAt;
      hasReceivedFreeCredits = profile.hasReceivedFreeCredits;
    };
    users.add(caller, updated);
    videoCounter += 1;
    let id = "vid_" # videoCounter.toText() # "_" # Time.now().toText();
    let job: VideoJob = {
      id = id;
      owner = caller;
      prompt = prompt;
      imageUrl = imageUrl;
      style = style;
      durationSeconds = durationSeconds;
      status = "processing";
      createdAt = Time.now();
      title = title;
      category = category;
    };
    videos.add(id, job);
    #ok(id)
  };

  public shared(msg) func simulateVideoComplete(id: Text): async { #ok; #err: Text } {
    switch (videos.get(id)) {
      case null { #err("Video not found") };
      case (?job) {
        if (not Principal.equal(job.owner, msg.caller)) {
          return #err("Not your video");
        };
        let updated: VideoJob = {
          id = job.id;
          owner = job.owner;
          prompt = job.prompt;
          imageUrl = job.imageUrl;
          style = job.style;
          durationSeconds = job.durationSeconds;
          status = "completed";
          createdAt = job.createdAt;
          title = job.title;
          category = job.category;
        };
        videos.add(id, updated);
        #ok
      };
    }
  };

  public shared(msg) func getMyVideos(): async [VideoJob] {
    let caller = msg.caller;
    videos.values().filter(func(v: VideoJob): Bool {
      Principal.equal(v.owner, caller)
    }).toArray()
  };

  public shared query(_msg) func getVideoById(id: Text): async ?VideoJob {
    videos.get(id)
  };

  // ---- Admin APIs ----
  public shared(msg) func getAllUsers(): async [UserWithPrincipal] {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") { return [] };
        users.entries().map(func((principal, profile): (Principal, UserProfile)): UserWithPrincipal {
          { principal = principal; profile = profile }
        }).toArray()
      };
      case null { [] };
    }
  };

  public shared(msg) func getAllVideos(): async [VideoJob] {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") { return [] };
        videos.values().toArray()
      };
      case null { [] };
    }
  };

  public shared(msg) func updateUserCredits(userId: Principal, newCredits: Nat): async { #ok; #err: Text } {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") { return #err("Not admin") };
        switch (users.get(userId)) {
          case null { #err("User not found") };
          case (?target) {
            let updated: UserProfile = {
              credits = newCredits;
              role = target.role;
              createdAt = target.createdAt;
              hasReceivedFreeCredits = target.hasReceivedFreeCredits;
            };
            users.add(userId, updated);
            #ok
          };
        }
      };
      case null { #err("Not admin") };
    }
  };

  public shared(msg) func setUserRole(userId: Principal, role: Text): async { #ok; #err: Text } {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") { return #err("Not admin") };
        switch (users.get(userId)) {
          case null { #err("User not found") };
          case (?target) {
            let updated: UserProfile = {
              credits = target.credits;
              role = role;
              createdAt = target.createdAt;
              hasReceivedFreeCredits = target.hasReceivedFreeCredits;
            };
            users.add(userId, updated);
            #ok
          };
        }
      };
      case null { #err("Not admin") };
    }
  };

  public shared(msg) func deleteVideo(id: Text): async { #ok; #err: Text } {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") { return #err("Not admin") };
        videos.remove(id);
        #ok
      };
      case null { #err("Not admin") };
    }
  };

  public shared(msg) func getStats(): async PlatformStats {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != "admin") {
          return { totalUsers = 0; totalVideos = 0; totalCreditsIssued = 0 };
        };
        {
          totalUsers = users.size();
          totalVideos = videos.size();
          totalCreditsIssued = totalCreditsIssued;
        }
      };
      case null { { totalUsers = 0; totalVideos = 0; totalCreditsIssued = 0 } };
    }
  };
};
