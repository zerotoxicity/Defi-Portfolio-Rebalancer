import { Card } from "@chakra-ui/react";
import PoolCardBody from "./PoolCardBody";
import PoolHeader from "./PoolHeader";

const PoolCard = () => {
  return (
    <Card m={20}>
      <PoolHeader />
      <PoolCardBody />
    </Card>
  );
};

export default PoolCard;
