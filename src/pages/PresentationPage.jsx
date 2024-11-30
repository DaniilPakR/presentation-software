import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Stage,
  Layer,
  Text,
  Rect,
  Circle,
  Arrow,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import { UserContext } from "../context/userContext";
import { jsPDF } from "jspdf";
import useImage from "use-image"; // Correct import for the useImage hook

export default function PresentationPage() {
  const { currentUsername, showMessage } = useContext(UserContext);
  const [presData, setPresData] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // For zoom functionality
  const { id } = useParams();
  const selectedElementRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [updateData, setUpdateData] = useState(0);

  // Image loading logic using 'useImage' during render
  const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
  };

  useEffect(() => {
    if (presData?.content?.slides) {
      presData.content.slides.forEach((slide) => {
        slide.elements.forEach((element) => {
          if (element.type === "image" && !loadedImages[element.id]) {
            const image = loadImage(element.src);
            setLoadedImages((prev) => ({ ...prev, [element.id]: image }));
          }
        });
      });
    }
  }, [presData]); // Reload images whenever presentation data changes

  const FIREBASE_URL =
    "https://presentation-software-25854-default-rtdb.europe-west1.firebasedatabase.app";

  const fetchPresentationById = async (presentationId) => {
    try {
      const response = await fetch(
        `${FIREBASE_URL}/presentations/${presentationId}.json?timestamp=${Date.now()}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch presentation.");

      const data = await response.json();
      if (data && data.content && Array.isArray(data.content.slides)) {
        const slides = data.content.slides.map((slide) => ({
          ...slide,
          elements: slide.elements || [],
        }));
        setPresData({ ...data, content: { ...data.content, slides } });
      } else {
        showMessage("Presentation data is invalid.");
      }
    } catch (error) {
      console.error("Error fetching presentation:", error);
      showMessage("Error fetching presentation.");
    }
  };

  useEffect(() => {
    fetchPresentationById(id);
  }, [id, updateData, showMessage]);

  const updatePresentation = async (updatedData) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/presentations/${id}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update presentation.");
      setPresData(updatedData);
      showMessage("Presentation updated successfully!");
    } catch (error) {
      console.error("Error updating presentation:", error);
      showMessage("Error updating presentation.");
    }
  };

  const addTextBlock = () => {
    const newText = {
      id: `text-${Date.now()}`,
      x: 50,
      y: 50,
      text: "New Text",
      fontSize: 20,
      draggable: true,
      type: "text",
    };

    const updatedSlides = [...presData.content.slides];
    updatedSlides[currentSlideIndex].elements.push(newText);

    const updatedData = {
      ...presData,
      content: { ...presData.content, slides: updatedSlides },
    };

    updatePresentation(updatedData);
  };

  const addShape = (type) => {
    const newShape = {
      id: `${type}-${Date.now()}`,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: "blue",
      draggable: true,
      type,
    };

    const updatedSlides = [...presData.content.slides];
    updatedSlides[currentSlideIndex].elements.push(newShape);

    const updatedData = {
      ...presData,
      content: { ...presData.content, slides: updatedSlides },
    };

    updatePresentation(updatedData);
  };

  const addImage = (imageUrl) => {
    const newImage = {
      id: `image-${Date.now()}`,
      x: 50,
      y: 50,
      draggable: true,
      type: "image",
      src: imageUrl,
    };

    const updatedSlides = [...presData.content.slides];
    updatedSlides[currentSlideIndex].elements.push(newImage);

    const updatedData = {
      ...presData,
      content: { ...presData.content, slides: updatedSlides },
    };

    updatePresentation(updatedData);
  };

  const handleDragEnd = (index, e) => {
    const { x, y } = e.target.position();

    const updatedSlides = [...presData.content.slides];
    updatedSlides[currentSlideIndex].elements[index] = {
      ...updatedSlides[currentSlideIndex].elements[index],
      x,
      y,
    };

    const updatedData = {
      ...presData,
      content: { ...presData.content, slides: updatedSlides },
    };

    updatePresentation(updatedData);
  };

  const deleteElement = (index) => {
    const updatedSlides = [...presData.content.slides];
    updatedSlides[currentSlideIndex].elements.splice(index, 1);

    const updatedData = {
      ...presData,
      content: { ...presData.content, slides: updatedSlides },
    };

    updatePresentation(updatedData);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    presData.content.slides.forEach((slide, index) => {
      if (index !== 0) pdf.addPage();
      pdf.text(`Slide ${index + 1}`, 10, 10);
      slide.elements.forEach((el) => {
        if (el.type === "text") {
          pdf.text(el.text, el.x, el.y);
        }
      });
    });
    pdf.save(`${presData.title}.pdf`);
  };

  if (!presData) {
    return <div>Loading presentation...</div>;
  }

  const currentSlide = presData.content.slides[currentSlideIndex];

  async function MakeViewer(username) {
    const userToUpdate = presData?.editors ? presData.editors[username] : null;
    if (userToUpdate) {
      // Remove user from editors and add to viewers
      const updatedEditors = { ...presData?.editors };
      delete updatedEditors[username]; // Remove the user from editors
  
      const updatedViewers = {
        ...presData?.viewers,
        [username]: userToUpdate, // Add the user to viewers
      };
  
      await fetch(`${FIREBASE_URL}/presentations/${id}.json`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          editors: updatedEditors,
          viewers: updatedViewers,
        }),
      });
    }
  }
  
  async function MakeEditor(username) {
    const userToUpdate = presData?.viewers ? presData.viewers[username] : null;
    if (userToUpdate) {
      // Remove user from viewers and add to editors
      const updatedViewers = { ...presData?.viewers };
      delete updatedViewers[username]; // Remove the user from viewers
  
      const updatedEditors = {
        ...presData?.editors,
        [username]: userToUpdate, // Add the user to editors
      };
  
      await fetch(`${FIREBASE_URL}/presentations/${id}.json`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewers: updatedViewers,
          editors: updatedEditors,
        }),
      });
    }
  }
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        Presentation: {presData.title}
        <button onClick={() => setUpdateData((prev) => prev + 1)}>
          Refresh Presentation Data
        </button>
      </h1>

      <div className="flex mb-4">
        {presData.content.slides.map((slide, index) => (
          <button
            key={index}
            className={`px-4 py-2 border ${
              index === currentSlideIndex
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
            onClick={() => setCurrentSlideIndex(index)}
          >
            Slide {index + 1}
          </button>
        ))}
      </div>

      <div className="border w-[800px] h-[600px] relative bg-gray-100 overflow-hidden">
        <Stage
          width={800}
          height={600}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
          onClick={() => (selectedElementRef.current = null)}
        >
          <Layer>
            {currentSlide?.elements?.map((element, index) => {
              if (element.type === "text") {
                return (
                  <Text
                    key={index}
                    x={element.x}
                    y={element.y}
                    text={element.text}
                    fontSize={element.fontSize}
                    draggable={isEditing}
                    onDragEnd={(e) => handleDragEnd(index, e)}
                  />
                );
              }

              if (element.type === "image") {
                return (
                  <KonvaImage
                    key={element.id}
                    image={loadedImages[element.id]} // Use preloaded image
                    x={element.x}
                    y={element.y}
                    draggable={isEditing}
                    width={element.width || 100}
                    height={element.height || 100}
                    onDragEnd={(e) => handleDragEnd(index, e)}
                  />
                );
              }

              if (element.type === "rectangle") {
                return (
                  <Rect
                    key={index}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill || "blue"}
                    draggable={isEditing}
                    onDragEnd={(e) => handleDragEnd(index, e)}
                  />
                );
              }

              if (element.type === "circle") {
                return (
                  <Circle
                    key={index}
                    x={element.x}
                    y={element.y}
                    radius={element.radius}
                    fill={element.fill || "red"}
                    draggable={isEditing}
                    onDragEnd={(e) => handleDragEnd(index, e)}
                  />
                );
              }

              return null;
            })}
          </Layer>
        </Stage>
      </div>

      {currentUsername === presData?.creator && (
        <ul>
          <h2>Viewers:</h2>
          {Object.values(presData.viewers ?? {}).map((viewer, index) => (
              <li key={index}>
                <h1>{viewer.username}</h1>
                <button onClick={() => MakeEditor(viewer.username)}>
                  Make Editor
                </button>
              </li>
            )
          )}
          <h2>Editors:</h2>
          {Object.values(presData.editors ?? {}).map((viewer, index) => (
              <li key={index}>
                <h1>{viewer.username}</h1>
                <button onClick={() => MakeViewer(viewer.username)}>
                Make Viewer
                </button>
              </li>
            )
          )}
        </ul>
      )}

      {currentUsername === presData.creator && (
        <div className="mt-4">
          <button
            onClick={addTextBlock}
            className="px-4 py-2 bg-green-500 text-white mr-2"
          >
            Add Text
          </button>
          <button
            onClick={() => addShape("rectangle")}
            className="px-4 py-2 bg-yellow-500 text-white mr-2"
          >
            Add Rectangle
          </button>
          <button
            onClick={() => addShape("circle")}
            className="px-4 py-2 bg-purple-500 text-white mr-2"
          >
            Add Circle
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-500 text-white"
          >
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
}
