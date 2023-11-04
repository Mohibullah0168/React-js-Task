import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import DraggableImage from "@/components/Gallery/DraggableImage.jsx";
import DragOverlayImage from "@/components/Gallery/DragOverlayImage.jsx";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

const GalleryLayout = () => {
  const [images, setImages] = useState([]); //Initial array that holds all image path and their corresponding id
  const [selectedImages, setSelectedImages] = useState([]); // Array State that will contain only the checked images.
  const [activeId, setActiveId] = useState(null);

  //Bulk Importing image source path as URL together leveraging Glob Import provided by Vite
  const imagesSrc = Object.values(
    import.meta.glob("@/assets/*.{png,jpg,jpeg,PNG,JPEG,webp}", { eager: true, as: "url" })
  );

  //Creating an array filled with Object each having two keys id: unique id & src: image path
  useEffect(() => {
    const tempArray = [];
    imagesSrc.forEach((image, index) => {
      const tempObject = { id: index + 1, src: image };
      tempArray.push(tempObject);
    });

    setImages([...tempArray]);
  }, []);

  //Loading sensors from dnd-kit so that drag n drop works on mobile devices
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10
      }
    }),
    useSensor(TouchSensor)
  );

  //Function to fire whenever an image is checked or unchecked using the checkbox
  //This adds the checked image to the selectedImage state or removes it if it's already there, checks by comparing id.
  const handleImageCheck = (e) => {
    const existingImage = selectedImages.find((image) => image.id === parseInt(e.target.id));

    if (existingImage) {
      setSelectedImages(selectedImages.filter((image) => image.id !== existingImage.id));
    } else {
      const imageObject = images.find((image) => image.id === parseInt(e.target.id));
      setSelectedImages([...selectedImages, imageObject]);
    }
  };

  //Function that handles delete operation upon clicking Delete button
  const handleImageDelete = () => {
    setImages(
      images.filter((image) => !selectedImages.some((toDelete) => toDelete.id === image.id))
    );
    setSelectedImages([]);
  };

  //Function to check if an image is already in the selectedImage array.
  const getSelectionStatus = (event) => {
    //Using Js double negation so that the function will return true if it finds a truthy value(an image) or false if the value is falsy(undefined)
    return !!selectedImages.find((image) => image.id === event?.id);
  };

  //Since we are using an array of objects, we can't directly get the index of an object using image id.
  //We need to find the object we are looking for, then get the index of that object
  const getIndex = (id) => {
    let index = -1;
    images.forEach((image) => {
      if (image.id === id) {
        index = images.indexOf(image);
      }
    });

    return index;
  };

  //Get the index of the active item as in the image that is being dragged
  const activeIndex = activeId ? getIndex(activeId) : -1;

  //Function that's invoked when image dragging starts
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  //Function that's invoked when image dragging is finished
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over?.id) {
      const oldIndex = getIndex(active.id);
      const newIndex = getIndex(over?.id);

      //Deep copy the images array since normal spread still points to original array
      //So that we can run splice method on it without modifying the original array to removed and re-insert dragged image.
      const imagesCopy = JSON.parse(JSON.stringify(images));
      const removedImageObject = imagesCopy.splice(oldIndex, 1);
      imagesCopy.splice(newIndex, 0, removedImageObject[0]);

      setImages(imagesCopy);
    }

    setActiveId(null);
  };

  //Function to run if a drag is cancelled
  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div
      className={
        " mt-4 flex w-[95%] flex-col gap-8 rounded rounded-[8px] bg-white md:mt-0 md:w-[95%] xl:w-[65%]"
      }
    >
      <div className={"flex items-center justify-between px-12 pt-8"}>
        {selectedImages.length > 0 ? (
          <>
            <div>
              <p className={"text-xl font-semibold"}>
                {`${selectedImages.length} File${selectedImages.length > 1 ? "s" : ""} Selected`}
              </p>
            </div>
            <p
              onClick={handleImageDelete}
              className={"cursor-pointer text-red-600 hover:underline"}
            >
              {`Delete File${selectedImages.length > 1 ? "s" : ""}`}
            </p>
          </>
        ) : (
          <p className={"text-xl font-semibold"}>Gallery</p>
        )}
      </div>
      <div className={"h-[1px] w-full bg-gray-500 opacity-50"} />
      {/*Everything related to drag n drop happens inside this context*/}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/*Must provide the images array and a sorting strategy (preferably a build in one)*/}
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div
            className={
              "grid auto-rows-[145px] grid-cols-2 place-items-center gap-x-8 gap-y-8 px-6 pb-10 md:auto-rows-[150px] md:grid-cols-4 xl:grid-cols-5 2xl:auto-rows-[200px]"
            }
          >
            {images?.map((image, index) => (
              <DraggableImage
                key={image.id}
                index={index}
                image={image}
                getSelectionStatus={getSelectionStatus}
                handleImageCheck={handleImageCheck}
              />
            ))}
            <div
              className={
                "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-[8px] border border-dashed border-gray-500 border-opacity-50"
              }
            >
              <ImagePlus />
              <p className={"font-medium"}>Add Images</p>
            </div>
          </div>
        </SortableContext>
        {/*Using a drag overlay so that the dragging experience feels smooth and animated*/}
        <DragOverlay adjustScale>
          {activeId ? <DragOverlayImage image={images[activeIndex]} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default GalleryLayout;
