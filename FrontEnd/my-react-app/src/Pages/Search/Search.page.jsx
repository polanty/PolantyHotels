import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectData } from "../../store/auth/auth.selectors";
import { paginatedHotels } from "../../store/auth/auth.thunks";

export default function SearchResultsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, status, error } = useSelector(selectData); // adjust slice key

  // pull params from URL
  const location = searchParams.get("location") || undefined;
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;
  const guests = searchParams.get("guests") || undefined;
  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    // build params object, only include ones that exist
    const params = {
      ...(location ? { location } : {}),
      ...(checkIn ? { checkIn } : {}),
      ...(checkOut ? { checkOut } : {}),
      ...(guests ? { guests } : {}),
      page,
    };

    dispatch(paginatedHotels(params));
  }, [dispatch, location, checkIn, checkOut, guests, page]);

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return (
    <div>
      <h1>Search Results</h1>

      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p style={{ color: "crimson" }}>{error}</p>}

      {status === "succeeded" && (
        <>
          <pre>{JSON.stringify(data, null, 2)}</pre>

          <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Prev
          </button>
          <button onClick={() => goToPage(page + 1)}>Next</button>
        </>
      )}
    </div>
  );
}
