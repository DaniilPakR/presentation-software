import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import { UserContext } from "../context/userContext";

const FIREBASE_URL =
  "https://presentation-software-25854-default-rtdb.europe-west1.firebasedatabase.app/";

export default function PresentationsList() {
  const navigate = useNavigate();
  const {
    currentUsername,
    showMessage,
    setRegPresInputShown,
    setUsernameInputShown,
    dontShowUsernameInput,
  } = useContext(UserContext);
  const [presentations, setPresentations] = useState([]);
  const [updateList, setUpdateList] = useState(0);

  useEffect(() => {
    if (dontShowUsernameInput > 0) {
      return;
    } else {
      setUsernameInputShown(true);
    }
  }, []);

  useEffect(() => {
    async function fetchPresentations() {
      try {
        const response = await fetch(`${FIREBASE_URL}presentations.json`, {
          method: "GET",
        });

        if (!response.ok) throw new Error("Failed to fetch presentations.");

        const data = await response.json();
        const dataArray = data
          ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
          : [];
        setPresentations(dataArray);
      } catch (error) {
        console.error(error);
        showMessage("Error fetching presentations.");
      }
    }

    fetchPresentations();
  }, [updateList]);

  async function viewPres(id, username) {
    const presentation = presentations.find((pres) => pres.id === id);

    if (presentation && username === presentation.creator) {
      showMessage("The creator cannot be added as a viewer.");
      return;
    }

    try {
      const response = await fetch(
        `${FIREBASE_URL}/presentations/${id}/viewers.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      if (!response.ok) throw new Error("Failed to register viewer.");

      const data = await response.json();
      showMessage("Viewer registered successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Error registering viewer.");
    }
  }

  async function handleViewPresentation(id, username) {
    try {
      await viewPres(id, username); // Wait for the viewer to be registered
      navigate(`/${id}`); // Navigate only after registration is complete
    } catch (error) {
      console.error("Failed to view presentation:", error);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <button
        onClick={() => setRegPresInputShown(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
      >
        Create Presentation
      </button>
      <button
        onClick={() => setUpdateList(prev => prev + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
      >
        Update List
      </button>

      {/* Presentations List */}
      <ul className="space-y-4">
        {presentations.map((pres) => (
          <li
            key={pres.id}
            className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <h1 className="text-lg font-semibold">{pres.title}</h1>
            <h3 className="text-sm text-gray-500">
              {pres.creator || "Unknown Creator"}
            </h3>
            <button
              onClick={() => handleViewPresentation(pres.id, currentUsername)}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
