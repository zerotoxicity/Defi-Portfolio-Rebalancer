import AssetCard from "./AssetCard/AssetCard";
import EmptyAssetCard from "./AssetCard/EmptyAssetCard";

const AssetCardPanel = () => {
  return (
    <>
      <EmptyAssetCard />
      <AssetCard
        img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1024px-MetaMask_Fox.svg.png?20201112074605"
        imgName="Ethereum"
      />
    </>
  );
};

export default AssetCardPanel;
