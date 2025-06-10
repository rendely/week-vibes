import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import bannerImage from "./assets/banner.png";

const starterBuckets = [
  {
    id: uuidv4(),
    name: "Chill / Veg",
    entries: [
      { id: uuidv4(), title: "Read fiction book", count: 0 },
      { id: uuidv4(), title: "Watch a movie", count: 0 },
      { id: uuidv4(), title: "Watch TV show", count: 0 }
    ]
  },
  {
    id: uuidv4(),
    name: "Outdoor",
    entries: [
      { id: uuidv4(), title: "Walk dogs", count: 0 },
      { id: uuidv4(), title: "Go for a run", count: 0 },
      { id: uuidv4(), title: "Beer on balcony", count: 0 }
    ]
  }
];

export default function App() {
  const [buckets, setBuckets] = useState(() => {
    const saved = localStorage.getItem('week-vibes-buckets');
    return saved ? JSON.parse(saved) : starterBuckets;
  });
  const [newBucketName, setNewBucketName] = useState("");
  const [entryInputs, setEntryInputs] = useState({});

  useEffect(() => {
    localStorage.setItem('week-vibes-buckets', JSON.stringify(buckets));
  }, [buckets]);

  const incrementEntry = (bucketId, entryId) => {
    setBuckets(prev =>
      prev.map(bucket =>
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
      )
    );
  };

  const addBucket = () => {
    const name = newBucketName.trim();
    if (!name) return;
    setBuckets(prev => [...prev, { id: uuidv4(), name, entries: [] }]);
    setNewBucketName("");
  };

  const removeBucket = bucketId => {
    setBuckets(prev => prev.filter(b => b.id !== bucketId));
    setEntryInputs(prev => {
      const copy = { ...prev };
      delete copy[bucketId];
      return copy;
    });
  };

  const addEntry = (bucketId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setBuckets(prev =>
      prev.map(bucket =>
        bucket.id === bucketId
          ? {
              ...bucket,
              entries: [
                ...bucket.entries,
                { id: uuidv4(), title: trimmed, count: 0 }
              ]
            }
          : bucket
      )
    );
  };

  const removeEntry = (bucketId, entryId) => {
    setBuckets(prev =>
      prev.map(bucket =>
        bucket.id === bucketId
          ? {
              ...bucket,
              entries: bucket.entries.filter(e => e.id !== entryId)
            }
          : bucket
      )
    );
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
              <h2 className="text-2xl font-bold text-blue-700">
                {bucket.name}{" "}
                <span className="text-base font-normal">
                  ({bucket.entries.reduce((sum, e) => sum + e.count, 0)})
                </span>
              </h2>
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
                  <span>
                    {entry.title} ({entry.count})
                  </span>
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