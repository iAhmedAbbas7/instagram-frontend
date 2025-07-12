// <= IMPORTS =>
import axiosClient from "@/utils/axiosClient";
import { useCallback, useEffect, useRef, useState } from "react";

const useSearchUsers = (initialQuery = "") => {
  // STATE MANAGEMENT
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [hasFetched, setHasFetched] = useState(false);
  // KEEPING A REF FOR THE DEBOUNCE TIMER
  const debounceRef = useRef(null);
  // EFFECT TO FETCH THE RESULTS WHENEVER THE QUERY CHANGES
  useEffect(() => {
    // CLEARING THE DEBOUNCE REF CURRENT VALUE
    clearTimeout(debounceRef.current);
    // IF NO QUERY EXISTS
    if (!query.trim()) {
      // RE-SETTING ALL STATES
      setUsers([]);
      setHasMore(false);
      setLoading(false);
      setHasFetched(false);
      // RETURNING
      return;
    }
    // ADDING TIMEOUT TO DEBOUNCE REF
    debounceRef.current = setTimeout(() => {
      setUsers([]);
      setPage(1);
      setHasFetched(false);
      fetchPage(1, query, true);
    }, 300);
    // CLEANUP FUNCTION
    return () => clearTimeout(debounceRef.current);
  }, [query]);
  // FETCHING RESULTS HANDLER
  const fetchPage = async (pageNumber, q, replace = false) => {
    // LOADING STATE
    setLoading(true);
    // CLEARING ERROR
    setError(null);
    // MAKING REQUEST
    try {
      const response = await axiosClient.get(`/user/searchInfiniteUsers`, {
        params: { q, page: pageNumber, limit: 10 },
      });
      // SETTING USERS
      setUsers((prev) =>
        replace ? response.data.users : [...prev, response.data.users]
      );
      // SETTING HAS MORE FLAG
      setHasMore(response.data.pagination.hasMore);
      // SETTING OUR HAS FETCHED FLAG FOR THE NEW SEARCH
      if (pageNumber === 1) setHasFetched(true);
    } catch (error) {
      // LOGGING ERROR MESSAGE
      console.error("Failed to Fetch Users!", error);
      // SETTING ERROR
      setError(error);
    } finally {
      // LOADING STATE
      setLoading(false);
    }
  };
  // EXPOSING A LOAD MORE HANDLER FOR INTERSECTION OBSERVER
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    // UPDATING PAGE NUMBER FOR NEXT CALL
    const nextPage = page + 1;
    // FETCHING NEXT PAGE
    fetchPage(nextPage, query, false);
    // SETTING PAGE NUMBER
    setPage(nextPage);
  }, [query, page, hasMore, loading]);
  // RETURNING DATA
  return {
    query,
    users,
    error,
    hasMore,
    loading,
    setQuery,
    loadMore,
    hasFetched,
  };
};

export default useSearchUsers;
