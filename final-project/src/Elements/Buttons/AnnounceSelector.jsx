import React from "react";
import styled from "styled-components";
import mixin from "../../Styles/Mixin";
import { useSelector } from "react-redux";

//isSelected가 true/false일 때 스타일링이 적용되어있습니다.
const AnnounceSelector = ({ isSelected, onClick, children, ...props }) => {
    const isDarkTheme = useSelector(state => state.user.isDarkTheme); //다크모드인지 아닌지 판별 state

    return (
        <Button
            isSelected={isSelected}
            onClick={onClick}
            isDarkTheme={isDarkTheme}
            {...props}
        >
            {children}
        </Button>
    );
};

const Button = styled.button`
    padding: 0 10px;
    min-width: 79px;
    height: 32px;
    box-sizing: border-box;
    border-radius: 16px;
    transition: all 0.5s ease;
    background-color: ${props =>
        props.isSelected
            ? props.theme.color.mainMint
            : props.isDarkTheme
            ? props.theme.color.black
            : props.theme.color.white};

    ${props =>
        props.isSelected
            ? mixin.textProps(18, "semiBold", "gray1")
            : mixin.textProps(18, "semiBold", "gray3")}
    ${props =>
        props.isSelected
            ? `box-shadow: inset -2px 5px 5px -5px ${
                  props.isDarkTheme ? "rgba(0,0,0,.8)" : "#cdcdcd"
              };`
            : `box-shadow:  0 5px 5px -4px ${
                  props.isDarkTheme ? "rgba(0,0,0,.8)" : "#cdcdcd"
              };`}
        ${props =>
        mixin.outline("2px solid", props.isSelected ? "mainMint" : "blue2")}
        ${props => props.rightGap && `margin-right:${props.rightGap};`}
        ${props => props.leftGap && `margin-left:${props.leftGap};`}
        ${props =>
        props.lastNoGap &&
        `:last-child{
        margin:0;
    }`}
        ${props =>
        props.fistNoGap &&
        `:first-child{
        margin:0;
    }`};

    @media ${({ theme }) => theme.mobile} {
        min-width: ${({ theme }) => theme.calRem(56)};
        height: ${({ theme }) => theme.calRem(24)};
        ${props =>
            props.isSelected
                ? mixin.textProps(11, "semiBold", "gray1")
                : mixin.textProps(11, "semiBold", "gray3")}
    }
`;

export default AnnounceSelector;
