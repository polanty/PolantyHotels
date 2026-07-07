import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaginationControls from "../../Components/PaginationControls.jsx";
import { adminEndpoints } from "../../axios/axios.endpoint";
import { getErrorMessage } from "./hotelFormUtils";

const pageSize = 10;

function getHotelsFromResponse(response) {
  return response.data?.data?.data?.allHotels || [];
}

function getPaginationFromResponse(response) {
  return {
    currentPage: response.data?.currentPage || 1,
    totalPages: response.data?.totalPages || 1,
    totalResults: response.data?.totalResults || response.data?.results || 0,
    limit: response.data?.limit || pageSize,
  };
}

export default function ManageHotelsPanel({ refreshKey = 0 }) {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: pageSize,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function loadHotels(page = currentPage) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await adminEndpoints.getHotels({
        page,
        limit: pageSize,
      });
      setHotels(getHotelsFromResponse(response));
      setPagination(getPaginationFromResponse(response));
      setStatus("succeeded");
    } catch (error) {
      setStatus("failed");
      setMessage(getErrorMessage(error));
    }
  }

  useEffect(() => {
    loadHotels(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refreshKey]);

  const deleteHotel = async (hotelId) => {
    const shouldDelete = window.confirm(
      "Delete this hotel from active listings?",
    );
    if (!shouldDelete) return;

    setStatus("loading");
    setMessage("");

    try {
      await adminEndpoints.deleteHotel(hotelId);
      setMessage("Hotel deleted from active listings.");
      await loadHotels(currentPage);
    } catch (error) {
      setStatus("failed");
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <section className="usersPanel fullPanel">
      <div className="panelHeader">
        <div>
          <p className="adminEyebrow">Manage</p>
          <h2>Hotels</h2>
        </div>
        <button
          type="button"
          className="secondaryButton"
          disabled={status === "loading"}
          onClick={() => loadHotels(currentPage)}
        >
          {status === "loading" ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {message && (
        <p
          className={
            status === "failed" ? "authMessage error" : "authMessage success"
          }
        >
          {message}
        </p>
      )}

      <div className="tableWrap">
        <table className="usersTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Country</th>
              <th>Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel._id}>
                <td>{hotel.name}</td>
                <td>{hotel.address}</td>
                <td>{hotel.city}</td>
                <td>{hotel.country}</td>
                <td>{hotel.RoomRef?.length || 0}</td>
                <td>
                  <div className="tableActions">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/hotels/${hotel._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="dangerButton"
                      onClick={() => deleteHotel(hotel._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {status !== "loading" && hotels.length === 0 && (
              <tr>
                <td colSpan="6">No hotels found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        isLoading={status === "loading"}
        onPageChange={setCurrentPage}
        pagination={pagination}
      />
    </section>
  );
}
