import { Card } from "flowbite-react";
import { ASSETCARD_MARGIN, EMPTY_TEXT } from "../StringConstant";

const EmptyAssetCard = () => {
  return (
    <Card className={`${ASSETCARD_MARGIN} `}>
      <div className="grid grid-cols-10 ">
        <div className={`${EMPTY_TEXT} col-span-2 `}>CURRENCY</div>
        <div className={`${EMPTY_TEXT} col-span-1 `}>APY</div>
        <div
          className={`${EMPTY_TEXT}  col-span-2 col-start-4 text-center `}
        >
          FARMING
        </div>
        <div
          className={`${EMPTY_TEXT}  col-span-2 col-start-6 text-center `}
        >
          DEPOSITED
        </div>
      </div>
    </Card>
  );
};

export default EmptyAssetCard;
