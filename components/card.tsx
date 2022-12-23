
interface CardProps {
  onClick: () => void;
  imageUrl: string;
  videoUrl?: string;
  label: string;
  description: string;
  selected?: boolean;
  hover?: boolean;
  isSafari?: boolean;
}

const Card = ({ onClick, imageUrl, videoUrl, label, description, selected, hover, isSafari }: CardProps) => {
  return (
    <a
      onClick={onClick}
      className={`my-2 overflow-hidden max-w-sm bg-gray-800 rounded-lg border-2 shadow-md ${hover ? "hover:border-blue-500" : ""} ${selected ? "border-blue-500" : "border-gray-700"}`}
    >
      {(!videoUrl || isSafari) && <img src={imageUrl} alt="snaps image" />}
      {(videoUrl && !isSafari) && <video src={videoUrl} controls autoPlay loop />}
      <div className="p-5">
        <h5 className="mb-2 text-xl font-bold tracking-tight">{label}</h5>
        <p className="mb-2 font-normal">{description}</p>
      </div>
    </a>
  )
}

export default Card
