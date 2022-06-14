const AssetDiv = ({ img, imgName }) => {
  return (
    <div className="space-x-1 flex items-center">
      <span>
        <img src={img} className="w-10 h-10 rounded inline-block" />
      </span>
      <span className="inline-block ">{imgName}</span>
    </div>
  );
};

export default AssetDiv;
