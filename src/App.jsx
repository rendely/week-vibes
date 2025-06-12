import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import bannerImage from "./assets/banner.png";
import zeldaMusic from "./assets/zelda.mp3";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
import AuthForm from "./components/AuthForm";

const starterBuckets = [
  {
    id: uuidv4(),
    name: "Body Boost",
    entries: [
      { id: uuidv4(), title: "Go for a walk", count: 0 },
      { id: uuidv4(), title: "Do some stretches", count: 0 },
      { id: uuidv4(), title: "Dance to music", count: 0 }
    ]
  },
  {
    id: uuidv4(),
    name: "Mind Reset",
    entries: [
      { id: uuidv4(), title: "Take a power nap", count: 0 },
      { id: uuidv4(), title: "Watch something funny", count: 0 },
      { id: uuidv4(), title: "Call a friend", count: 0 }
    ]
  },
  {
    id: uuidv4(),
    name: "Create & Play",
    entries: [
      { id: uuidv4(), title: "Try a new recipe", count: 0 },
      { id: uuidv4(), title: "Write in a journal", count: 0 },
      { id: uuidv4(), title: "Learn something new", count: 0 }
    ]
  }
];

export default function App() {
  const { user, loading: authLoading, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { buckets, loading: dataLoading, error, updateBuckets } = useUserData(user);
  
  const [newBucketName, setNewBucketName] = useState("");
  const [entryInputs, setEntryInputs] = useState({});
  const [editingBucket, setEditingBucket] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editBucketName, setEditBucketName] = useState("");
  const [editEntryTitle, setEditEntryTitle] = useState("");
  const [audioInstance, setAudioInstance] = useState(null);

  // Show auth form if user is not signed in
  if (!authLoading && !user) {
    return (
      <AuthForm 
        onSignIn={signInWithEmail} 
        onSignUp={signUpWithEmail} 
      />
    );
  }

  // Show loading spinner while authenticating or loading data
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-teal-100 to-green-100 flex items-center justify-center">
        <div className="text-2xl text-teal-600">Loading...</div>
      </div>
    );
  }

  // Show error if there's a data loading error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-teal-100 to-green-100 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl mb-4">Error loading data</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  

  const totalScore = buckets.reduce((total, bucket) => 
    total + bucket.entries.reduce((sum, entry) => sum + entry.count, 0), 0
  );

  const getVibeLevel = (score) => {
    if (score > 20) return { level: "Very High", color: "text-purple-600", bg: "bg-purple-100" };
    if (score > 10) return { level: "High", color: "text-green-600", bg: "bg-green-100" };
    if (score > 5) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Low", color: "text-gray-600", bg: "bg-gray-100" };
  };

  const vibe = getVibeLevel(totalScore);

  const playZeldaMusic = () => {
    if (audioInstance && !audioInstance.paused) {
      return;
    }
    const audio = new Audio(zeldaMusic);
    audio.volume = 0.5;
    audio.play();
    setAudioInstance(audio);
  };

  const incrementEntry = (bucketId, entryId) => {
    playZeldaMusic();
    const newBuckets = buckets.map(bucket =>
      bucket.id === bucketId
        ? {
            ...bucket,
            entries: bucket.entries.map(entry =>
              entry.id === entryId
                ? { ...entry, count: entry.count + 1 }
                : entry
            )
          }
        : bucket
    );
    updateBuckets(newBuckets);
  };

  const addBucket = () => {
    const name = newBucketName.trim();
    if (!name) return;
    const newBuckets = [...buckets, { id: uuidv4(), name, entries: [] }];
    updateBuckets(newBuckets);
    setNewBucketName("");
  };

  const removeBucket = bucketId => {
    const newBuckets = buckets.filter(b => b.id !== bucketId);
    updateBuckets(newBuckets);
    setEntryInputs(prev => {
      const copy = { ...prev };
      delete copy[bucketId];
      return copy;
    });
  };

  const addEntry = (bucketId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newBuckets = buckets.map(bucket =>
      bucket.id === bucketId
        ? {
            ...bucket,
            entries: [
              ...bucket.entries,
              { id: uuidv4(), title: trimmed, count: 0 }
            ]
          }
        : bucket
    );
    updateBuckets(newBuckets);
  };

  const removeEntry = (bucketId, entryId) => {
    const newBuckets = buckets.map(bucket =>
      bucket.id === bucketId
        ? {
            ...bucket,
            entries: bucket.entries.filter(e => e.id !== entryId)
          }
        : bucket
    );
    updateBuckets(newBuckets);
  };

  const clearAllScores = () => {
    if (window.confirm('Are you sure you want to clear all scores? This will reset all counts to 0 and cannot be undone.')) {
      const clearedBuckets = buckets.map(bucket => ({
        ...bucket,
        entries: bucket.entries.map(entry => ({
          ...entry,
          count: 0
        }))
      }));
      updateBuckets(clearedBuckets);
    }
  };

  const startEditingBucket = (bucketId, currentName) => {
    setEditingBucket(bucketId);
    setEditBucketName(currentName);
  };

  const saveEditBucket = (bucketId) => {
    const name = editBucketName.trim();
    if (!name) return;
    
    const updatedBuckets = buckets.map(bucket =>
      bucket.id === bucketId
        ? { ...bucket, name }
        : bucket
    );
    updateBuckets(updatedBuckets);
    setEditingBucket(null);
    setEditBucketName("");
  };

  const cancelEditBucket = () => {
    setEditingBucket(null);
    setEditBucketName("");
  };

  const startEditingEntry = (entryId, currentTitle) => {
    setEditingEntry(entryId);
    setEditEntryTitle(currentTitle);
  };

  const saveEditEntry = (bucketId, entryId) => {
    const title = editEntryTitle.trim();
    if (!title) return;
    
    const updatedBuckets = buckets.map(bucket =>
      bucket.id === bucketId
        ? {
            ...bucket,
            entries: bucket.entries.map(entry =>
              entry.id === entryId
                ? { ...entry, title }
                : entry
            )
          }
        : bucket
    );
    updateBuckets(updatedBuckets);
    setEditingEntry(null);
    setEditEntryTitle("");
  };

  const cancelEditEntry = () => {
    setEditingEntry(null);
    setEditEntryTitle("");
  };

  return (
    <div className="bg-gradient-to-br from-blue-200 via-teal-100 to-green-100 min-h-screen font-sans">
      <div 
        className="w-full mb-6 flex justify-center"
        style={{ backgroundColor: 'rgba(106,169,160,255)' }}
      >
        <img 
          src={bannerImage} 
          alt="Week Vibes Banner" 
          className="h-48 object-contain"
        />
      </div>
      <div className="p-6 max-w-4xl mx-auto">
        <div className={`${vibe.bg} rounded-2xl p-4 mb-6 text-center border border-opacity-30`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-700">Vibe Meter</h2>
            <div className="flex items-center gap-4">
              <div className={`${vibe.color} text-2xl font-bold`}>
                {vibe.level}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="text-gray-500 hover:text-red-500 text-sm underline"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-lg text-gray-600">
              Total Score: <span className="font-semibold">{totalScore}</span>
            </div>
            <button
              type="button"
              onClick={clearAllScores}
              className="text-gray-400 hover:text-red-500 text-xs underline"
            >
              clear
            </button>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold mb-6 text-teal-600">Vibe Tracker</h1>

      {/* New Bucket */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
          type="text"
          value={newBucketName}
          onChange={e => setNewBucketName(e.target.value)}
          placeholder="New Bucket Name"
        />
        <button
          type="button"
          onClick={addBucket}
          className="bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600"
        >
          + Add Bucket
        </button>
      </div>

      {/* Buckets */}
      <div className="grid gap-6">
        {buckets.map(bucket => (
          <div
            key={bucket.id}
            className="rounded-2xl shadow-lg p-5 border border-blue-200 bg-white/80"
          >
            <div className="flex justify-between items-center mb-2">
              {editingBucket === bucket.id ? (
                <div className="flex gap-2 items-center flex-1">
                  <input
                    className="text-2xl font-bold text-blue-700 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 flex-1"
                    type="text"
                    value={editBucketName}
                    onChange={e => setEditBucketName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEditBucket(bucket.id);
                      if (e.key === 'Escape') cancelEditBucket();
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveEditBucket(bucket.id)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditBucket}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-blue-700">
                    {bucket.name}{" "}
                    <span className="text-base font-normal">
                      ({bucket.entries.reduce((sum, e) => sum + e.count, 0)})
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => startEditingBucket(bucket.id, bucket.name)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeBucket(bucket.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete Bucket
              </button>
            </div>

            {/* Entries */}
            <ul className="space-y-2 mb-4">
              {bucket.entries.map(entry => (
                <li
                  key={entry.id}
                  className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-xl"
                >
                  {editingEntry === entry.id ? (
                    <div className="flex gap-2 items-center flex-1">
                      <input
                        className="bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 flex-1"
                        type="text"
                        value={editEntryTitle}
                        onChange={e => setEditEntryTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEditEntry(bucket.id, entry.id);
                          if (e.key === 'Escape') cancelEditEntry();
                        }}
                        autoFocus
                      />
                      <span>({entry.count})</span>
                      <button
                        type="button"
                        onClick={() => saveEditEntry(bucket.id, entry.id)}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditEntry}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span>
                        {entry.title} ({entry.count})
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditingEntry(entry.id, entry.title)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => incrementEntry(bucket.id, entry.id)}
                      className="bg-blue-400 text-white px-2 py-1 rounded hover:bg-blue-500"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEntry(bucket.id, entry.id)}
                      className="text-sm text-gray-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* New Entry */}
            <form
              onSubmit={e => {
                e.preventDefault();
                const currentInput = entryInputs[bucket.id] || "";
                addEntry(bucket.id, currentInput);
                setEntryInputs(prev => ({ ...prev, [bucket.id]: "" }));
              }}
              className="flex gap-2"
            >
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="text"
                value={entryInputs[bucket.id] || ""}
                onChange={e =>
                  setEntryInputs(prev => ({
                    ...prev,
                    [bucket.id]: e.target.value
                  }))
                }
                placeholder="New Entry"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
              >
                + Add
              </button>
            </form>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}