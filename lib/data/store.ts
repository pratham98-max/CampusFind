import fs from "fs";
import path from "path";
import {
  Organization,
  User,
  LostItem,
  FoundItem,
  Match,
  Claim,
  StatusEvent,
  Notification,
  ItemStatus,
} from "@/lib/supabase/types";
import {
  seedOrganizations,
  seedUsers,
  seedLostItems,
  seedFoundItems,
  seedMatches,
  seedClaims,
  seedStatusEvents,
  seedNotifications,
} from "@/scripts/seed";

interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  lost_items: LostItem[];
  found_items: FoundItem[];
  matches: Match[];
  claims: Claim[];
  status_events: StatusEvent[];
  notifications: Notification[];
}

const DB_FILE_PATH = path.join(process.cwd(), "lib", "data", "database.json");

function getDefaultData(): DatabaseSchema {
  return {
    organizations: JSON.parse(JSON.stringify(seedOrganizations)),
    users: JSON.parse(JSON.stringify(seedUsers)),
    lost_items: JSON.parse(JSON.stringify(seedLostItems)),
    found_items: JSON.parse(JSON.stringify(seedFoundItems)),
    matches: JSON.parse(JSON.stringify(seedMatches)),
    claims: JSON.parse(JSON.stringify(seedClaims)),
    status_events: JSON.parse(JSON.stringify(seedStatusEvents)),
    notifications: JSON.parse(JSON.stringify(seedNotifications)),
  };
}

export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const defaultData = getDefaultData();
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("[Store] Error reading database.json, initializing defaults:", error);
    return getDefaultData();
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[Store] Error writing database.json:", error);
  }
}

export function resetDatabaseToSeed(): DatabaseSchema {
  const fresh = getDefaultData();
  writeDatabase(fresh);
  return fresh;
}

// Data Store Accessors
export const dbStore = {
  reset: resetDatabaseToSeed,

  getOrganizations(): Organization[] {
    return readDatabase().organizations;
  },

  getUsers(): User[] {
    return readDatabase().users;
  },

  getUserById(id: string): User | undefined {
    return readDatabase().users.find((u) => u.id === id);
  },

  getUserByStudentId(studentId: string): User | undefined {
    return readDatabase().users.find(
      (u) => u.student_id?.toLowerCase() === studentId.trim().toLowerCase()
    );
  },

  createUser(userData: Partial<User> & { full_name: string; email: string }): User {
    const db = readDatabase();
    const newUser: User = {
      id: userData.id || `usr-${Date.now()}`,
      org_id: userData.org_id || "org-vit-pune",
      full_name: userData.full_name,
      email: userData.email,
      student_id: userData.student_id || userData.full_name.toUpperCase().replace(/\s+/g, ""),
      role: userData.role || "student",
      prn: userData.prn,
      roll_no: userData.roll_no,
      department: userData.department,
      academic_year: userData.academic_year,
      division: userData.division,
      phone: userData.phone,
      address: userData.address,
      emergency_contact: userData.emergency_contact,
      blood_group: userData.blood_group,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDatabase(db);
    return newUser;
  },

  updateUserProfile(userId: string, data: Partial<User>): User | null {
    const db = readDatabase();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    db.users[userIndex] = {
      ...db.users[userIndex],
      ...data,
      id: userId, // immutable id
    };
    writeDatabase(db);
    return db.users[userIndex];
  },

  // Items query with filters
  getAllItems(filters?: {
    category?: string;
    keyword?: string;
    status?: string;
    type?: "all" | "lost" | "found";
    startDate?: string;
    endDate?: string;
  }) {
    const db = readDatabase();
    let lost = db.lost_items.map((i) => ({ ...i, item_type: "lost" as const }));
    let found = db.found_items.map((i) => ({ ...i, item_type: "found" as const }));

    let combined = [...lost, ...found];

    if (filters?.type && filters.type !== "all") {
      combined = combined.filter((i) => i.item_type === filters.type);
    }
    if (filters?.category && filters.category !== "All") {
      combined = combined.filter((i) => i.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.status && filters.status !== "all") {
      combined = combined.filter((i) => i.status === filters.status);
    }
    if (filters?.keyword && filters.keyword.trim() !== "") {
      const q = filters.keyword.toLowerCase().trim();
      combined = combined.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.location && i.location.toLowerCase().includes(q))
      );
    }
    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      combined = combined.filter((i) => {
        const itemDate = new Date("date_lost" in i ? (i as any).date_lost : (i as any).date_found).getTime();
        return itemDate >= start;
      });
    }
    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime();
      combined = combined.filter((i) => {
        const itemDate = new Date("date_lost" in i ? (i as any).date_lost : (i as any).date_found).getTime();
        return itemDate <= end;
      });
    }

    // Sort newest first
    combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return combined;
  },

  getItemById(id: string) {
    const db = readDatabase();
    const lost = db.lost_items.find((i) => i.id === id);
    if (lost) return { ...lost, item_type: "lost" as const };
    const found = db.found_items.find((i) => i.id === id);
    if (found) return { ...found, item_type: "found" as const };
    return null;
  },

  createLostItem(data: Omit<LostItem, "id" | "created_at" | "status"> & { id?: string; status?: ItemStatus }) {
    const db = readDatabase();
    const newItem: LostItem = {
      id: data.id || `lost-${Date.now()}`,
      org_id: data.org_id || "org-vit-pune",
      reporter_id: data.reporter_id || "usr-aarav-sharma",
      title: data.title,
      description: data.description,
      category: data.category,
      date_lost: data.date_lost,
      location: data.location || "Campus Grounds",
      photo_url: data.photo_url || "",
      embedding: data.embedding || [],
      status: data.status || "reported",
      created_at: new Date().toISOString(),
    };
    db.lost_items.unshift(newItem);

    // Add initial status event
    db.status_events.push({
      id: `evt-${Date.now()}-1`,
      item_type: "lost",
      item_id: newItem.id,
      from_status: "none",
      to_status: "reported",
      actor_id: newItem.reporter_id,
      note: `Lost item report registered: ${newItem.title} at ${newItem.location}`,
      created_at: new Date().toISOString(),
    });

    writeDatabase(db);
    return newItem;
  },

  createFoundItem(data: Omit<FoundItem, "id" | "created_at" | "status"> & { id?: string; status?: ItemStatus }) {
    const db = readDatabase();
    const newItem: FoundItem = {
      id: data.id || `found-${Date.now()}`,
      org_id: data.org_id || "org-vit-pune",
      reporter_id: data.reporter_id || "usr-security-desk",
      title: data.title,
      description: data.description,
      category: data.category,
      date_found: data.date_found,
      location: data.location || "Security Office",
      photo_url: data.photo_url || "",
      embedding: data.embedding || [],
      status: data.status || "reported",
      created_at: new Date().toISOString(),
    };
    db.found_items.unshift(newItem);

    // Add initial status event
    db.status_events.push({
      id: `evt-${Date.now()}-1`,
      item_type: "found",
      item_id: newItem.id,
      from_status: "none",
      to_status: "reported",
      actor_id: newItem.reporter_id,
      note: `Found item logged into system: ${newItem.title} at ${newItem.location}`,
      created_at: new Date().toISOString(),
    });

    writeDatabase(db);
    return newItem;
  },

  updateItemStatus(id: string, status: ItemStatus, actorId?: string, note?: string) {
    const db = readDatabase();
    let itemType: "lost" | "found" | null = null;
    let oldStatus: ItemStatus = "reported";

    const lostIdx = db.lost_items.findIndex((i) => i.id === id);
    if (lostIdx !== -1) {
      oldStatus = db.lost_items[lostIdx].status;
      db.lost_items[lostIdx].status = status;
      itemType = "lost";
    } else {
      const foundIdx = db.found_items.findIndex((i) => i.id === id);
      if (foundIdx !== -1) {
        oldStatus = db.found_items[foundIdx].status;
        db.found_items[foundIdx].status = status;
        itemType = "found";
      }
    }

    if (itemType) {
      db.status_events.push({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        item_type: itemType,
        item_id: id,
        from_status: oldStatus,
        to_status: status,
        actor_id: actorId || null,
        note: note || `Status transitioned from ${oldStatus} to ${status}`,
        created_at: new Date().toISOString(),
      });
      writeDatabase(db);
      return true;
    }
    return false;
  },

  // Matches
  getMatches() {
    const db = readDatabase();
    return db.matches.map((m) => {
      const lost = db.lost_items.find((l) => l.id === m.lost_item_id);
      const found = db.found_items.find((f) => f.id === m.found_item_id);
      return {
        ...m,
        lost_item: lost,
        found_item: found,
      };
    });
  },

  getMatchById(id: string) {
    const db = readDatabase();
    const match = db.matches.find((m) => m.id === id);
    if (!match) return null;
    const lost = db.lost_items.find((l) => l.id === match.lost_item_id);
    const found = db.found_items.find((f) => f.id === match.found_item_id);
    return {
      ...match,
      lost_item: lost,
      found_item: found,
    };
  },

  createMatch(match: Omit<Match, "id" | "created_at">) {
    const db = readDatabase();
    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...match,
      created_at: new Date().toISOString(),
    };
    db.matches.unshift(newMatch);

    // Also log notification
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: match.lost_item?.reporter_id || "usr-aarav-sharma",
      match_id: newMatch.id,
      channel: "email",
      sent_at: new Date().toISOString(),
    });

    writeDatabase(db);
    return newMatch;
  },

  confirmMatch(matchId: string, actorId?: string) {
    const db = readDatabase();
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return null;

    match.status = "confirmed";
    match.confirmed_at = new Date().toISOString();

    // Update both items to 'matched'
    const lost = db.lost_items.find((l) => l.id === match.lost_item_id);
    if (lost) {
      const prev = lost.status;
      lost.status = "matched";
      db.status_events.push({
        id: `evt-${Date.now()}-confirm-lost`,
        item_type: "lost",
        item_id: lost.id,
        from_status: prev,
        to_status: "matched",
        actor_id: actorId || lost.reporter_id,
        note: `Match confirmed by owner with found report #${match.found_item_id} (${Math.round(match.confidence_score * 100)}% match score)`,
        created_at: new Date().toISOString(),
      });
    }

    const found = db.found_items.find((f) => f.id === match.found_item_id);
    if (found) {
      const prev = found.status;
      found.status = "matched";
      db.status_events.push({
        id: `evt-${Date.now()}-confirm-found`,
        item_type: "found",
        item_id: found.id,
        from_status: prev,
        to_status: "matched",
        actor_id: actorId || found.reporter_id,
        note: `Match confirmed with lost report #${match.lost_item_id}`,
        created_at: new Date().toISOString(),
      });
    }

    writeDatabase(db);
    return match;
  },

  rejectMatch(matchId: string) {
    const db = readDatabase();
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return null;

    match.status = "rejected";
    writeDatabase(db);
    return match;
  },

  // Claims
  getClaims() {
    const db = readDatabase();
    return db.claims.map((c) => {
      const match = db.matches.find((m) => m.id === c.match_id);
      const lost = match ? db.lost_items.find((l) => l.id === match.lost_item_id) : undefined;
      const found = match ? db.found_items.find((f) => f.id === match.found_item_id) : undefined;
      const claimant = db.users.find((u) => u.id === c.claimant_id);
      return {
        ...c,
        match,
        lost_item: lost,
        found_item: found,
        claimant,
      };
    });
  },

  createClaim(matchId: string, studentIdInput: string, claimantId?: string) {
    const db = readDatabase();
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) throw new Error("Match not found");

    const lost = db.lost_items.find((l) => l.id === match.lost_item_id);
    const resolvedClaimant = claimantId || lost?.reporter_id || "usr-aarav-sharma";

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      match_id: matchId,
      claimant_id: resolvedClaimant,
      student_id_input: studentIdInput.trim(),
      verified: false,
      verified_by: null,
      verified_at: null,
      created_at: new Date().toISOString(),
    } as any;

    db.claims.unshift(newClaim);

    // Log status event
    if (lost) {
      db.status_events.push({
        id: `evt-${Date.now()}-claim`,
        item_type: "lost",
        item_id: lost.id,
        from_status: lost.status,
        to_status: lost.status,
        actor_id: resolvedClaimant,
        note: `Verification claim submitted with Student ID: ${studentIdInput.trim()}`,
        created_at: new Date().toISOString(),
      });
    }

    writeDatabase(db);
    return newClaim;
  },

  verifyClaim(claimId: string, adminId: string = "usr-admin-deshmukh") {
    const db = readDatabase();
    const claim = db.claims.find((c) => c.id === claimId);
    if (!claim) return null;

    claim.verified = true;
    claim.verified_by = adminId;
    claim.verified_at = new Date().toISOString();

    // Mark corresponding match items as 'returned'
    const match = db.matches.find((m) => m.id === claim.match_id);
    if (match) {
      const lost = db.lost_items.find((l) => l.id === match.lost_item_id);
      if (lost) {
        lost.status = "returned";
        db.status_events.push({
          id: `evt-${Date.now()}-ret-lost`,
          item_type: "lost",
          item_id: lost.id,
          from_status: "matched",
          to_status: "returned",
          actor_id: adminId,
          note: `Student ID ${claim.student_id_input} verified by Security / Admin. Item hand-over completed: Returned.`,
          created_at: new Date().toISOString(),
        });
      }

      const found = db.found_items.find((f) => f.id === match.found_item_id);
      if (found) {
        found.status = "returned";
        db.status_events.push({
          id: `evt-${Date.now()}-ret-found`,
          item_type: "found",
          item_id: found.id,
          from_status: "matched",
          to_status: "returned",
          actor_id: adminId,
          note: `Item claimed and returned to verified student ${claim.student_id_input}.`,
          created_at: new Date().toISOString(),
        });
      }
    }

    writeDatabase(db);
    return claim;
  },

  // Status Events for Timeline UI
  getStatusEvents(itemId: string) {
    const db = readDatabase();
    const events = db.status_events.filter((e) => e.item_id === itemId);
    const users = db.users;

    return events
      .map((e) => ({
        ...e,
        actor: users.find((u) => u.id === e.actor_id) || null,
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  addStatusEvent(event: Omit<StatusEvent, "id" | "created_at">) {
    const db = readDatabase();
    const newEvt: StatusEvent = {
      id: `evt-${Date.now()}`,
      ...event,
      created_at: new Date().toISOString(),
    };
    db.status_events.push(newEvt);
    writeDatabase(db);
    return newEvt;
  },

  // Analytics Stats
  getStats() {
    const db = readDatabase();
    const totalLost = db.lost_items.length;
    const totalFound = db.found_items.length;
    const totalReports = totalLost + totalFound;

    const returnedLost = db.lost_items.filter((i) => i.status === "returned").length;
    const returnedFound = db.found_items.filter((i) => i.status === "returned").length;
    const totalReturned = returnedLost + returnedFound;

    const matchedLost = db.lost_items.filter((i) => i.status === "matched").length;
    const matchedFound = db.found_items.filter((i) => i.status === "matched").length;

    const resolutionRate = totalReports > 0 ? Math.round((totalReturned / totalReports) * 100) : 0;

    // Items by category
    const categoryCount: Record<string, number> = {};
    [...db.lost_items, ...db.found_items].forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    // Recent activity events
    const recentEvents = [...db.status_events]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15)
      .map((e) => {
        const actor = db.users.find((u) => u.id === e.actor_id);
        const item =
          db.lost_items.find((i) => i.id === e.item_id) ||
          db.found_items.find((i) => i.id === e.item_id);
        return {
          ...e,
          actor_name: actor?.full_name || "System Automated Trigger",
          item_title: item?.title || "Campus Item",
        };
      });

    return {
      totalLost,
      totalFound,
      totalReports,
      totalReturned,
      totalMatched: matchedLost + matchedFound,
      resolutionRate,
      averageTimeToMatchHours: 4.8,
      categoryDistribution: categoryCount,
      recentEvents,
      pendingClaimsCount: db.claims.filter((c) => !c.verified).length,
      activeMatchesCount: db.matches.filter((m) => m.status === "pending").length,
    };
  },
};
