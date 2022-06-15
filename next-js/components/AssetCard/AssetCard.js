import { Button, Card } from "flowbite-react";
import { useContext, useState } from "react";
import { ASSETCARD_MARGIN } from "../StringConstant";
import ApyDiv from "./ApyDiv";
import AssetDiv from "./AssetDiv";
import FarmingDiv from "./FarmingDiv";
import AuthContext from "../../store/auth-context";
import DepositModal from "./Modal/DepositModal";

const AssetCard = ({ img = "", text = "" }) => {
  const [display, setDisplay] = useState(false);
  const authContext = useContext(AuthContext);

  const onClickHandler = () => {
    setDisplay(true);
  }

  const fnHandler = (data) => {
    setDisplay(data);
  }

  return (
    <Card className={`${ASSETCARD_MARGIN} `}>
      {display && <DepositModal function={fnHandler} />}
      <div className="grid grid-cols-10 items-center">
        <AssetDiv img={img} text={text} className="col-span-2 grid grid-cols-4 items-center" />
        <ApyDiv className="col-span-1 col-end-4" />
        <FarmingDiv className="col-span-2 justify-self-center" />
        <div className="col-span-2 text-center"> </div>
        <Button disabled={!authContext.isLoggedIn} onClick={onClickHandler} className="col-span-2 col-end-11 justify-self-end" >Deposit</Button>
      </div>
    </Card>
  );
};

export default AssetCard;
