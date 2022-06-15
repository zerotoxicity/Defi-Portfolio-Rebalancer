import { ICON_STYLE, PLACEHOLDER_IMAGE } from "../StringConstant";

const FarmingDiv = (props) => {
    const DUMMY_IMG = [
        { icon: PLACEHOLDER_IMAGE, id: 1 },
        { icon: PLACEHOLDER_IMAGE, id: 2 },
        { icon: PLACEHOLDER_IMAGE, id: 3 }
    ];

    return (
        <div className={props.className}>
            <div className="flex flex-row ">
                {DUMMY_IMG.map((item) =>
                    <img key={item.id} src={item.icon} className={ICON_STYLE} />)}
            </div>
        </div>
    );
}

export default FarmingDiv;