import { Card } from "flowbite-react";
import { EMPTY_TEXT_COLOUR } from "./StringConstant";

const EmptyAssetCard = () => {
  return (
    <Card className="mx-10 ">
      <div className="grid grid-cols-10 ">
        <div className={`${EMPTY_TEXT_COLOUR} col-span-2 `}>CURRENCY</div>
        <div className={`${EMPTY_TEXT_COLOUR} col-span-1 text-left`}>APY</div>
        <div
          className={`${EMPTY_TEXT_COLOUR}  col-span-2 col-start-4 text-center `}
        >
          FARMING
        </div>
        <div
          className={`${EMPTY_TEXT_COLOUR}  col-span-2 col-start-6 text-center `}
        >
          DEPOSITED
        </div>
      </div>
    </Card>
  );
};

export default EmptyAssetCard;
