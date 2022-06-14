import { Button, Card } from "flowbite-react";
import AssetDiv from "./AssetDiv";

const AssetCard = ({ text = "", img = "", imgName = "" }) => {
  return (
    <Card className="mx-10">
      <div className="grid grid-cols-10">
        <AssetDiv img={img} imgName={imgName} />
        <Button className="col-span-2 col-start-8" />
      </div>
    </Card>
  );
};

export default AssetCard;
