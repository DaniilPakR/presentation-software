import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { UserContext } from "../context/userContext";

const FIREBASE_URL =
  "https://presentation-software-25854-default-rtdb.europe-west1.firebasedatabase.app/";

export default function CreatePresentation() {
  const navigate = useNavigate();
  const {
    regPresInput,
    setRegPresInput,
    regPresInputShown,
    setRegPresInputShown,
    currentUsername,
    showMessage,
  } = useContext(UserContext);

  if (!regPresInputShown) {
    return null;
  }

  async function handleCreatePresentation() {
    if (regPresInput.trim() === "") {
      showMessage("Please enter a title.");
      return;
    }

    // Generate a temporary ID to store in the presentation
    const tempId = `temp-${Date.now()}`;

    // Initialize presentation content with a default slide
    const initialContent = {
      slides: [
        {
          id: `slide-${Date.now()}`,
          elements: [], // Empty elements for a clean start
        },
      ],
    };

    const newPresentation = {
      id: tempId, // Store ID in the item itself
      title: regPresInput,
      viewers: [],
      editors: [],
      content: initialContent, // Save initial content here
      creator: currentUsername,
    };

    try {
      const response = await fetch(`${FIREBASE_URL}/presentations.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPresentation),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create presentation: ${errorText}`);
      }

      const data = await response.json();
      const newPresentationId = data.name; // Firebase returns the generated ID

      // Update the ID in Firebase with the newly generated ID
      await fetch(`${FIREBASE_URL}/presentations/${newPresentationId}.json`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: newPresentationId }),
      });

      showMessage("Presentation created successfully.");
      setRegPresInput("");
      setRegPresInputShown(false);
      navigate(`/${newPresentationId}`);
    } catch (error) {
      console.error(error);
      showMessage("Error creating presentation.");
      setRegPresInput("");
      setRegPresInputShown(false);
    }
  }

  return (
    <div className="flex flex-col absolute top-1/3 left-1/3 items-start bg-white rounded-md p-6 shadow-lg max-w-md w-full">
      <p className="flex flex-col w-full">
        <label htmlFor="title" className="font-medium mb-1">
          Presentation Title:
        </label>
        <input
          id="title"
          type="text"
          value={regPresInput}
          onChange={(e) => setRegPresInput(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </p>
      <div className="flex flex-row justify-end mt-4 space-x-2">
        <button
          onClick={() => setRegPresInputShown(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleCreatePresentation}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
        >
          Create
        </button>
      </div>
    </div>
  );
}
