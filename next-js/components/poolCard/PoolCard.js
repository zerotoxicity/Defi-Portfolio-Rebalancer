import { Card } from "@chakra-ui/react";
import PoolCardBody from "./PoolCardBody";
import PoolHeader from "./PoolHeader";

/**
 * Card component containing the header info and card body component
 * This is the core of the dashboard
 */
const PoolCard = () => {
  return (
    <Card m={{ base: 1, md: 20 }}>
      <PoolHeader />
      <PoolCardBody />
    </Card>
  );
};

export default PoolCard;
