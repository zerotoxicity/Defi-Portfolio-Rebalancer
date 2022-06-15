import { ICON_STYLE } from "../StringConstant";

const AssetDiv = ({ className, img, text }) => {
  return (
    <div className={className}>
      <span className="col-span-1">
        <img src={img} className={`${ICON_STYLE}`} />
      </span>
      <span className="col-span-2 pl-1 text-left">{text}</span>
    </div>
  );
};

export default AssetDiv;
