import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../../Redux/Modules/userSlice";
import { onLogout } from "../../Redux/Modules/univBoardSlice";
import { history } from "../../Redux/configureStore";

import mixin from "../../Styles/Mixin";

import Swal from "sweetalert2";

const MypageHeader = props => {
    const isDarkTheme = useSelector(state => state.user.isDarkTheme);
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.user);

    const handleLogout = () => {
        Swal.fire("πΈ", "λ‘κ·Έμμ λμμ΅λλ€!", "success");
        dispatch(logoutUser());
        dispatch(onLogout());
        localStorage.removeItem("token");

        history.replace("/");
    };

    const handleGoToMyPost = e => {
        if (e.target.name === "myPost") {
            history.push("/mypost/post");
        } else {
            history.push("/mypost/comment");
        }
    };
    return (
        <React.Fragment>
            <MyPageHeader>
                {user && user.school_auth && (
                    <UnivName isDarkTheme={isDarkTheme}>
                        {user && user.university && user.university.name}
                    </UnivName>
                )}

                <UnivNameBox>
                    <Greeting isDarkTheme={isDarkTheme}>
                        {user && user.nickname}λ<br />
                        λ°κ°μ΅λλ€π
                    </Greeting>
                    <LogoutButton
                        isDarkTheme={isDarkTheme}
                        onClick={handleLogout}
                    >
                        λ‘κ·Έμμ
                    </LogoutButton>
                </UnivNameBox>
                <MyActivityContainer isDarkTheme={isDarkTheme}>
                    <ActivityTitle isDarkTheme={isDarkTheme}>
                        UFOμ ν¨κ»ν μκ°λ€
                    </ActivityTitle>
                </MyActivityContainer>
                <MyActivityButtonContainer>
                    <ActivityButton
                        name="alarm"
                        isDarkTheme={isDarkTheme}
                        onClick={() => alert("μλΉμ€ μ€λΉμ€ μλλ€")}
                    >
                        μ΅κ·Ό μλ¦Ό
                    </ActivityButton>
                    <ActivityButton
                        isDarkTheme={isDarkTheme}
                        name="myPost"
                        onClick={handleGoToMyPost}
                    >
                        λ΄κ° μ΄ κΈ
                    </ActivityButton>
                    <ActivityButton
                        isDarkTheme={isDarkTheme}
                        name="myComment"
                        onClick={handleGoToMyPost}
                    >
                        λ΄κ° μ΄ λκΈ
                    </ActivityButton>
                </MyActivityButtonContainer>
            </MyPageHeader>
        </React.Fragment>
    );
};

// μ€νμΌ μ»΄ν¬λνΈ
const MyPageHeader = styled.div`
    margin-bottom: 75px;
    @media ${({ theme }) => theme.mobile} {
        margin-bottom: 53px;
    } ;
`;
// λνκ΅ μ΄λ¦ + λ‘κ·Έμμ λ²νΌ κ°μΈλ div
const UnivNameBox = styled.div`
    margin-bottom: 70px;
    ${mixin.flexBox("space-between", "flex-end")};

    @media ${({ theme }) => theme.mobile} {
        ${mixin.flexBox(null, null, null, null)};
        ${mixin.flexBox("space-between", "center")};
    }
`;
//λνκ΅ μ΄λ¦
const UnivName = styled.span`
    display: block;
    margin-bottom: 10px;
    ${props =>
        mixin.textProps(20, "semiBold", props.isDarkTheme ? "gray3" : "gray2")};
    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                12,
                "semiBold",
                props.isDarkTheme ? "gray3" : "gray2",
            )};
    }
`;
// λ‘κ·Έμμ λ²νΌ
const LogoutButton = styled.button`
    width: 108px;
    height: 32px;
    border-radius: 60px;
    background-color: ${props => props.theme.color.mainBlue};
    ${props => (props.isDarkTheme ? null : mixin.boxShadow())};
    ${mixin.textProps(18, "semiBold", "white")};

    @media ${({ theme }) => theme.mobile} {
        width: ${({ theme }) => theme.calRem(74)};
        height: ${({ theme }) => theme.calRem(24)};
        ${mixin.textProps(11, "semiBold", "white")};
    }
`;
// μ μ λ€μ + μΈμ¬λ§ span
const Greeting = styled.span`
    ${props =>
        mixin.textProps(
            40,
            "extraBold",
            props.isDarkTheme ? "white" : "black",
        )};

    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                28,
                "extraBold",
                props.isDarkTheme ? "white" : "black",
            )};
    }
`;
// λ΄ νλ λ³΄κΈ° λ²νΌλ€μ κ°μΈλ div μ»¨νμ΄λ
const MyActivityContainer = styled.div`
    padding-bottom: 5px;
    ${props =>
        mixin.outline(
            "1.5px solid",
            props.isDarkTheme ? "darkLine" : "gray4",
            "bottom",
        )};
`;
// "λ΄ νλ λ³΄κΈ°" λ¬Έκ΅¬
const ActivityTitle = styled.span`
    ${props =>
        mixin.textProps(
            30,
            "extraBold",
            props.isDarkTheme ? "white" : "black",
        )};

    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                22,
                "extraBold",
                props.isDarkTheme ? "white" : "black",
            )};
    }
`;
// λ΄ νλ λ³΄κΈ° μμ λ²νΌ 3κ° κ°μΈλ div (μ΅κ·Ό μλ¦Ό, λ΄κ° μ΄κΈ, etc)
const MyActivityButtonContainer = styled.div`
    margin-top: 20px;
    width: 50%;
    ${mixin.flexBox("space-between")};
    @media ${({ theme }) => theme.mobile} {
        margin-top: ${({ theme }) => theme.calRem(8)};
        width: 85%;
    }
`;
//λ΄ νλ λ³΄κΈ° λ²νΌ
const ActivityButton = styled.button`
    width: 150px;
    border-radius: 76px;
    background: none;
    ${props => (props.isDarkTheme ? null : mixin.boxShadow())};
    ${mixin.flexBox("center", "center", null, "40px")};
    ${mixin.outline("2px solid", "blue2")};
    ${props =>
        mixin.textProps(18, "semiBold", props.isDarkTheme ? "gray2" : "gray3")};

    @media ${({ theme }) => theme.mobile} {
        width: ${({ theme }) => theme.calRem(89)};
        ${mixin.flexBox("center", "center", null, "24px")};
        ${props =>
            mixin.textProps(
                11,
                "semiBold",
                props.isDarkTheme ? "gray2" : "gray3",
            )};
    }
`;

export default MypageHeader;
