import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserData(user) {
  const [buckets, setBuckets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setBuckets([])
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('multi-tenant')
        .select('data')
        .eq('user_id', user.id)
        .eq('project_name', 'week-vibes')
        .eq('type', 'buckets')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (data?.data) {
        setBuckets(data.data)
      } else {
        // Initialize with starter buckets if no data exists
        const starterBuckets = [
          {
            id: crypto.randomUUID(),
            name: "Body Boost",
            entries: [
              { id: crypto.randomUUID(), title: "Go for a walk", count: 0 },
              { id: crypto.randomUUID(), title: "Do some stretches", count: 0 },
              { id: crypto.randomUUID(), title: "Dance to music", count: 0 }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: "Mind Reset",
            entries: [
              { id: crypto.randomUUID(), title: "Take a power nap", count: 0 },
              { id: crypto.randomUUID(), title: "Watch something funny", count: 0 },
              { id: crypto.randomUUID(), title: "Call a friend", count: 0 }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: "Create & Play",
            entries: [
              { id: crypto.randomUUID(), title: "Try a new recipe", count: 0 },
              { id: crypto.randomUUID(), title: "Write in a journal", count: 0 },
              { id: crypto.randomUUID(), title: "Learn something new", count: 0 }
            ]
          }
        ]
        setBuckets(starterBuckets)
        await saveUserData(starterBuckets)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveUserData = async (bucketsData) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('multi-tenant')
        .upsert({
          user_id: user.id,
          project_name: 'week-vibes',
          type: 'buckets',
          data: bucketsData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,project_name,type'
        })

      if (error) throw error
    } catch (err) {
      console.error('Error saving user data:', err)
      setError(err.message)
    }
  }

  const updateBuckets = async (newBuckets) => {
    setBuckets(newBuckets)
    await saveUserData(newBuckets)
  }

  return {
    buckets,
    loading,
    error,
    updateBuckets
  }
}