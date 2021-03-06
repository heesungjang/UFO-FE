import { css } from "styled-components";

//
const flexBox = (hoz, ver, direction, height = "100%") => {
    return css`
        display: flex;
        height: ${height};
        ${hoz && `justify-content: ${hoz}`};
        ${ver && `align-items: ${ver}`};
        ${direction && `flex-direction: ${direction}`}
    `;
};

// display:fixed or absolute or relative에 사용할 수 있습니다.
const floatBox = (position, top, right, bottom, left, zIndex) => {
    return css`
        position: ${position};
        top: ${top};
        right: ${right};
        bottom: ${bottom};
        left: ${left};
        ${zIndex && `z-index: ${zIndex}`};
    `;
};

const outline = (border, borderColor, direction) => {
    switch (direction) {
        case "top":
            return css`
                border-top: ${border} ${({ theme }) => theme.color[borderColor]};
            `;

        case "right":
            return css`
                border-right: ${border}
                    ${({ theme }) => theme.color[borderColor]};
            `;

        case "bottom":
            return css`
                border-bottom: ${border}
                    ${({ theme }) => theme.color[borderColor]};
            `;

        case "left":
            return css`
                border-left: ${border}
                    ${({ theme }) => theme.color[borderColor]};
            `;

        default:
            return css`
                border: ${border} ${({ theme }) => theme.color[borderColor]};
            `;
    }
};

const boxShadow = (x, y, blur, spread, color, inset = false) => {
    if (inset)
        return css`
            box-shadow: inset ${x ? x : "0px"} ${y ? y : "4px"}
                ${blur ? blur : "7px"} ${spread ? spread : "0px"}
                ${color ? color : "#e5e5e5"};
        `;

    return css`
        box-shadow: ${x ? x : "0px"} ${y ? y : "4px"} ${blur ? blur : "7px"}
            ${spread ? spread : "0px"} ${color ? color : "#e5e5e5"};
    `;
};

const darkBoxShadow = (x, y, blur, spread, color, inset = false) => {
    if (inset)
        return css`
            box-shadow: inset ${x ? x : "0px"} ${y ? y : "4px"}
                ${blur ? blur : "7px"} ${spread ? spread : "0px"}
                ${color ? color : "rgba(0,0,0,.6)"};
        `;

    return css`
        box-shadow: ${x ? x : "0px"} ${y ? y : "4px"} ${blur ? blur : "7px"}
            ${spread ? spread : "0px"} ${color ? color : "rgba(0,0,0,.6)"};
    `;
};

export { flexBox, floatBox, outline, boxShadow, darkBoxShadow };
