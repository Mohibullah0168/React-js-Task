import PropTypes from "prop-types";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

const DraggableImage = ({ index, image, getSelectionStatus, handleImageCheck }) => {
  const { isDragging, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    //Provide an id as a number or a string that is unique inside the DndContext
    id: image.id
  });

  //Container style of individual image that will be applied below TailwindCSS classes
  //So that it will take precedence over other CSS properties and make the transition smooth
  //And Resize the image while it's still being dragged depending on cell/tile it's being hovered on
  const containerStyle = {
    transform: CSS.Transform.toString(transform),
    transformOrigin: "0 0 ",
    transition
  };

  return (
    <div
      className={`relative ${index === 0 && "col-span-2 row-span-2"} ${
        isDragging ? "border-opacity-60" : "border-opacity-50"
      }
      group flex h-full w-full items-center justify-center overflow-hidden rounded rounded-[8px] border border-gray-500`}
      //Set NodeRef to the container to register and keep track of it.
      ref={setNodeRef}
      style={containerStyle}
    >
      <input
        type={"checkbox"}
        id={image.id}
        onChange={handleImageCheck}
        className={`absolute left-0 top-0 ${isDragging && "hidden"} ${
          getSelectionStatus(image) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } 
      z-40 ml-4 mt-4 h-[20px] w-[20px] cursor-grab duration-300 ease-in-out`}
      />
      <div
        className={`${isDragging ? "hidden" : "cursor-grab"} ${
          getSelectionStatus(image) ? "bg-white" : "bg-transparent group-hover:bg-black"
        } 
        absolute h-full w-full opacity-60 duration-300 ease-in-out
        `}
        //Spreading the listeners and attributes here instead of the container so that it will not mess with our checkbox operations
        //These spreads are required to enable drag and drop functionality
        //If we had a separate drag handle button, we would've spread these there.
        //Since this div is position absolute and full width/height it works as drag handle here.
        {...listeners}
        {...attributes}
      />
      <img
        src={image.src}
        alt={`image-${image.id}`}
        className={`${isDragging && "hidden"} h-full w-full`}
      />
    </div>
  );
};

//Since we are working on Js, PropTypes library is used to set type of the props and make them required/optional upon component mount.
DraggableImage.propTypes = {
  index: PropTypes.number.isRequired,
  image: PropTypes.object.isRequired,
  getSelectionStatus: PropTypes.func.isRequired,
  handleImageCheck: PropTypes.func.isRequired
};

export default DraggableImage;
