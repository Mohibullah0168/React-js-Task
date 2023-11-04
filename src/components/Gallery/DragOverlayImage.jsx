import PropTypes from "prop-types";

const DragOverlayImage = ({ image }) => {
  return (
    <div
      className={
        "flex h-full w-full items-center justify-center overflow-hidden rounded rounded-[8px] border border-gray-500 border-opacity-50 bg-white"
      }
    >
      <img src={image.src} alt={"image" + image.id} className={"h-full w-full"} />
    </div>
  );
};

DragOverlayImage.propTypes = {
  image: PropTypes.object.isRequired
};

export default DragOverlayImage;
