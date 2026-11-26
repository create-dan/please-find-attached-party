import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import {
  Check,
  Copy,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
  UserPlus,
} from 'lucide-react';
import {
  copyLeaderboardTable,
  copyOrDownloadLeaderboardImage,
} from '../utils/exportLeaderboard';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

const COLLECTION_NAME = 'doomParticipants';
const MIN_POINTS = -999;
const MAX_POINTS = 9999;
const MAX_NAME_LEN = 60;
const MAX_NOTE_LEN = 80;

interface ParticipantRecord {
  id: string;
  name: string;
  points: number;
  note?: string;
  createdBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

function makeSafeDocId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug || 'player'}-${suffix}`;
}

function clampPoints(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.max(MIN_POINTS, Math.min(MAX_POINTS, Math.trunc(val)));
}

export function DoomPointsLeaderboard() {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState('');

  // Auth & Admin state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add Participant form state
  const [newName, setNewName] = useState('');
  const [newPoints, setNewPoints] = useState('0');
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Row interaction states
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('0');
  const [editNote, setEditNote] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    'idle' | 'table' | 'image-copied' | 'image-downloaded'
  >('idle');

  if (fatalError) {
    throw fatalError;
  }

  // Track Firebase Auth & verify organizer role
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const isBootstrapped =
        Boolean(currentUser.emailVerified) &&
        currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;

      if (isBootstrapped) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      if (currentUser.emailVerified) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAdmin(adminSnap.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  // Real-time public leaderboard subscription
  useEffect(() => {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('points', 'desc')
    );

    const unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const rows: ParticipantRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: typeof data.name === 'string' ? data.name : 'Unknown',
            points: typeof data.points === 'number' ? data.points : 0,
            note: typeof data.note === 'string' ? data.note : undefined,
            createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          };
        });
        setParticipants(rows);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        } catch (wrapped) {
          if (wrapped instanceof Error) {
            setFatalError(wrapped);
          }
        }
      }
    );

    return () => unsubSnapshot();
  }, []);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.note && p.note.toLowerCase().includes(q))
    );
  }, [participants, searchQuery]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    participants.forEach((p, idx) => {
      map.set(p.id, idx + 1);
    });
    return map;
  }, [participants]);

  const handleSignIn = async () => {
    setActionError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Google sign-in could not be completed.'
      );
    }
  };

  const handleSignOut = async () => {
    setActionError('');
    setEditingId(null);
    setConfirmDeleteId(null);
    await signOut(auth);
  };

  const handleAddParticipant = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAdmin) return;

    const cleanName = newName.trim().slice(0, MAX_NAME_LEN);
    const cleanNote = newNote.trim().slice(0, MAX_NOTE_LEN);
    const parsedPoints = Number.parseInt(newPoints, 10);

    if (cleanName.length < 1) {
      setActionError('Enter a teammate name before adding.');
      return;
    }

    if (Number.isNaN(parsedPoints)) {
      setActionError('Points must be a whole number.');
      return;
    }

    setActionError('');
    setSubmitting(true);

    const participantId = makeSafeDocId(cleanName);
    const docPath = `${COLLECTION_NAME}/${participantId}`;
    const payload: Record<string, unknown> = {
      name: cleanName,
      points: clampPoints(parsedPoints),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (cleanNote.length > 0) {
      payload.note = cleanNote;
    }

    try {
      await setDoc(doc(db, COLLECTION_NAME, participantId), payload);
      setNewName('');
      setNewPoints('0');
      setNewNote('');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      } catch {
        setActionError('Could not add participant. Check organizer permissions.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustPoints = async (
    participant: ParticipantRecord,
    delta: number
  ) => {
    if (!isAdmin) return;
    setActionError('');
    setBusyId(participant.id);

    const nextPoints = clampPoints(participant.points + delta);
    const docPath = `${COLLECTION_NAME}/${participant.id}`;

    try {
      await updateDoc(doc(db, COLLECTION_NAME, participant.id), {
        points: nextPoints,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      } catch {
        setActionError('Could not update Doom Points. Check permissions.');
      }
    } finally {
      setBusyId(null);
    }
  };

  const startEditing = (participant: ParticipantRecord) => {
    setConfirmDeleteId(null);
    setEditingId(participant.id);
    setEditName(participant.name);
    setEditPoints(String(participant.points));
    setEditNote(participant.note || '');
  };

  const handleSaveEdit = async (participant: ParticipantRecord) => {
    if (!isAdmin) return;

    const cleanName = editName.trim().slice(0, MAX_NAME_LEN);
    const cleanNote = editNote.trim().slice(0, MAX_NOTE_LEN);
    const parsedPoints = Number.parseInt(editPoints, 10);

    if (cleanName.length < 1) {
      setActionError('Name cannot be empty.');
      return;
    }
    if (Number.isNaN(parsedPoints)) {
      setActionError('Points must be a whole number.');
      return;
    }

    setActionError('');
    setBusyId(participant.id);
    const docPath = `${COLLECTION_NAME}/${participant.id}`;

    try {
      await updateDoc(doc(db, COLLECTION_NAME, participant.id), {
        name: cleanName,
        points: clampPoints(parsedPoints),
        note: cleanNote,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      } catch {
        setActionError('Could not save changes.');
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (participantId: string) => {
    if (!isAdmin) return;
    setActionError('');
    setBusyId(participantId);
    const docPath = `${COLLECTION_NAME}/${participantId}`;

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, participantId));
      setConfirmDeleteId(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      } catch {
        setActionError('Could not remove participant.');
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyTable = async () => {
    const rows =
      filteredParticipants.length > 0 ? filteredParticipants : participants;
    if (rows.length === 0) return;

    setActionError('');
    const ok = await copyLeaderboardTable(rows);
    if (ok) {
      setCopyStatus('table');
      window.setTimeout(() => setCopyStatus('idle'), 2200);
    } else {
      setActionError('Could not copy table to clipboard.');
    }
  };

  const handleCopyImage = async () => {
    const rows =
      filteredParticipants.length > 0 ? filteredParticipants : participants;
    if (rows.length === 0) return;

    setActionError('');
    try {
      const outcome = await copyOrDownloadLeaderboardImage(rows);
      setCopyStatus(outcome === 'copied' ? 'image-copied' : 'image-downloaded');
      window.setTimeout(() => setCopyStatus('idle'), 2400);
    } catch {
      setActionError('Could not generate leaderboard image.');
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-white/15 bg-[#121824] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div
        aria-hidden="true"
        className="h-1 w-full"
        style={{ background: THEME_GRADIENT }}
      />

      <div className="p-6 sm:p-8">
        {/* Leaderboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live Standings</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-[#94A3B8]">
                {participants.length}{' '}
                {participants.length === 1 ? 'Competitor' : 'Competitors'}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-2xl sm:text-3xl tracking-tight text-[#F1F5F9]">
              Doom Points Leaderboard
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Filter */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find teammate..."
                aria-label="Filter leaderboard by name"
                className="w-44 sm:w-52 rounded-lg border border-white/15 bg-[#0B0F17] pl-9 pr-3 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#38BDF8] focus:outline-none min-h-[40px]"
              />
            </div>

            {/* Copy Table (Teams-ready HTML + plain fallback) */}
            <button
              type="button"
              disabled={participants.length === 0}
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-white/15 bg-[#0B0F17] text-[#F1F5F9] hover:border-[#38BDF8]/60 hover:bg-white/5 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              {copyStatus === 'table' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>Copied Table</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>Copy for Teams</span>
                </>
              )}
            </button>

            {/* Copy / Save Leaderboard Image */}
            <button
              type="button"
              disabled={participants.length === 0}
              onClick={handleCopyImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-white/15 bg-[#0B0F17] text-[#F1F5F9] hover:border-[#38BDF8]/60 hover:bg-white/5 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              {copyStatus === 'image-copied' || copyStatus === 'image-downloaded' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>
                    {copyStatus === 'image-copied' ? 'Copied Image' : 'Saved PNG'}
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* Organizer Auth Control */}
            {authReady && !user && (
              <button
                type="button"
                onClick={handleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-white/15 bg-[#0B0F17] text-[#F1F5F9] hover:border-[#38BDF8]/60 hover:bg-white/5 transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                <LogIn className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span>Organizer Sign In</span>
              </button>
            )}

            {authReady && user && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#94A3B8] truncate max-w-[180px]">
                  {isAdmin ? 'Organizer: ' : 'Viewer: '}
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/15 bg-[#0B0F17] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-white/30 transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline Error Message */}
        {actionError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-[#38BDF8]/40 bg-[#0EA5E9]/10 px-4 py-3 text-sm text-[#F1F5F9]"
          >
            {actionError}
          </div>
        )}

        {/* Signed-in non-admin notice */}
        {authReady && user && !isAdmin && (
          <p className="mt-4 text-xs text-[#94A3B8]">
            Signed in as view-only. Only the organizer account can add or edit Doom Points.
          </p>
        )}

        {/* Organizer Add Form */}
        {isAdmin && (
          <form
            onSubmit={handleAddParticipant}
            className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3 pb-6 border-b border-white/10"
          >
            <div className="sm:col-span-4">
              <label htmlFor="doom-add-name" className="sr-only">
                Teammate Name
              </label>
              <input
                id="doom-add-name"
                type="text"
                required
                maxLength={MAX_NAME_LEN}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Teammate name"
                className="w-full rounded-lg border border-white/15 bg-[#0B0F17] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#38BDF8] focus:outline-none min-h-[42px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="doom-add-points" className="sr-only">
                Initial Doom Points
              </label>
              <input
                id="doom-add-points"
                type="number"
                min={MIN_POINTS}
                max={MAX_POINTS}
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                placeholder="Points"
                className="w-full rounded-lg border border-white/15 bg-[#0B0F17] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#38BDF8] focus:outline-none min-h-[42px]"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="doom-add-note" className="sr-only">
                Reason or Note
              </label>
              <input
                id="doom-add-note"
                type="text"
                maxLength={MAX_NOTE_LEN}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Optional note (e.g. Survived prod deploy)"
                className="w-full rounded-lg border border-white/15 bg-[#0B0F17] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#38BDF8] focus:outline-none min-h-[42px]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                style={{ background: THEME_GRADIENT }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-white hover:brightness-110 disabled:opacity-60 transition-all whitespace-nowrap shrink-0 min-h-[42px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>{submitting ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Loading Skeleton State */}
        {loading && (
          <div className="mt-4 divide-y divide-white/10">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="py-3.5 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-4 w-8 rounded bg-white/10" />
                  <div className="h-4 w-36 rounded bg-white/10" />
                </div>
                <div className="h-5 w-16 rounded bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && participants.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-base font-medium text-[#F1F5F9]">
              No Doom Points recorded yet.
            </p>
            <p className="mt-1.5 text-sm text-[#94A3B8]">
              {isAdmin
                ? 'Add the first teammate above to kick off Dooms Month.'
                : 'Sign in as organizer to start logging scores for Nov 25 – Dec 17.'}
            </p>
          </div>
        )}

        {/* No Search Match State */}
        {!loading &&
          participants.length > 0 &&
          filteredParticipants.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-[#94A3B8]">
                No teammates matching &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
          )}

        {/* Populated Leaderboard Rows */}
        {!loading && filteredParticipants.length > 0 && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono text-[#94A3B8]">
                  <th className="py-3 pr-4 font-medium w-16">Rank</th>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium text-right w-32">
                    Doom Points
                  </th>
                  {isAdmin && (
                    <th className="py-3 pl-4 font-medium text-right w-56">
                      Adjust
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {filteredParticipants.map((participant) => {
                  const rank = rankMap.get(participant.id) ?? 0;
                  const isLeader = rank === 1 && participant.points > 0;
                  const isEditing = editingId === participant.id;
                  const isBusy = busyId === participant.id;

                  if (isEditing && isAdmin) {
                    return (
                      <tr key={participant.id} className="bg-[#0B0F17]/60">
                        <td className="py-3 pr-4 font-mono tabular-nums text-[#94A3B8]">
                          #{String(rank).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              maxLength={MAX_NAME_LEN}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              aria-label="Edit name"
                              className="rounded-md border border-white/20 bg-[#0B0F17] px-2.5 py-1.5 text-sm text-[#F1F5F9] focus:border-[#38BDF8] focus:outline-none min-h-[36px]"
                            />
                            <input
                              type="text"
                              maxLength={MAX_NOTE_LEN}
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              placeholder="Note"
                              aria-label="Edit note"
                              className="rounded-md border border-white/20 bg-[#0B0F17] px-2.5 py-1.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#38BDF8] focus:outline-none min-h-[36px]"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            min={MIN_POINTS}
                            max={MAX_POINTS}
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            aria-label="Edit points"
                            className="w-24 rounded-md border border-white/20 bg-[#0B0F17] px-2.5 py-1.5 text-right font-mono tabular-nums text-sm text-[#F1F5F9] focus:border-[#38BDF8] focus:outline-none min-h-[36px]"
                          />
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSaveEdit(participant)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0EA5E9] text-[#0B0F17] hover:bg-[#38BDF8] transition-colors min-h-[36px]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-xs font-medium rounded-md border border-white/15 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors min-h-[36px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={participant.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td
                        className={`py-3.5 pr-4 font-mono tabular-nums font-medium ${
                          isLeader ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
                        }`}
                      >
                        #{String(rank).padStart(2, '0')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#F1F5F9]">
                            {participant.name}
                          </span>
                          {participant.note && (
                            <span className="text-xs text-[#94A3B8]">
                              {participant.note}
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-mono text-base font-medium tabular-nums ${
                          isLeader ? 'text-[#38BDF8]' : 'text-[#F1F5F9]'
                        }`}
                      >
                        {participant.points}
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 pl-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAdjustPoints(participant, -1)}
                              aria-label={`Subtract 1 point from ${participant.name}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#0B0F17] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-white/30 disabled:opacity-50 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAdjustPoints(participant, 1)}
                              aria-label={`Add 1 point to ${participant.name}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#0B0F17] text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#0EA5E9]/10 disabled:opacity-50 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAdjustPoints(participant, 5)}
                              aria-label={`Add 5 points to ${participant.name}`}
                              className="inline-flex h-9 px-2.5 items-center justify-center rounded-md border border-white/15 bg-[#0B0F17] font-mono text-xs text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#0EA5E9]/10 disabled:opacity-50 transition-colors"
                            >
                              +5
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => startEditing(participant)}
                              aria-label={`Edit ${participant.name}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#0B0F17] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-white/30 disabled:opacity-50 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            {confirmDeleteId === participant.id ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDelete(participant.id)}
                                className="inline-flex h-9 px-2.5 items-center justify-center rounded-md bg-red-600 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setConfirmDeleteId(participant.id)}
                                aria-label={`Remove ${participant.name}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#0B0F17] text-[#94A3B8] hover:text-red-400 hover:border-red-400/50 disabled:opacity-50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
