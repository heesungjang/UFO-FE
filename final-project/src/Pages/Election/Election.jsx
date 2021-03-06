import React, { useState, useEffect } from "react";
import styled from "styled-components";
import mixin from "../../Styles/Mixin";
import theme from "../../Styles/theme";
import { history } from "../../Redux/configureStore";
import { Helmet } from "react-helmet";
import moment from "moment";

//통신
import { useSelector, useDispatch } from "react-redux";
import { getElectionListDB } from "../../Redux/Async/election";

//컴포넌트
import Message from "../../Components/Shared/Message";
import DefaultButton from "../../Elements/Buttons/DefaultButton";
import DefaultSelector from "../../Elements/Buttons/DefaultSelector";

const Election = () => {
    const dispatch = useDispatch();
    const isDarkTheme = useSelector(state => state.user.isDarkTheme);
    const electionList = useSelector(state => state.election.list);
    const isLogin = useSelector(state => state.user.isLoggedIn); //login을 했는지 안했는지 판별값으로 사용합니다.
    const isSchoolAuth = useSelector(state => state.user.user.school_auth)
        ? true
        : false; //학교인증을 했는지 안했는지 판별값
    const [isOngoing, setIsOngoing] = useState(true);

    useEffect(() => {
        if (isLogin) dispatch(getElectionListDB());
    }, [isLogin]);

    const ongoingElectionList = electionList.filter(post =>
        moment().isBefore(post.end_date),
    );
    const finishedElectionList = electionList.filter(post =>
        moment().isAfter(post.end_date),
    );
    const currentList = isOngoing ? ongoingElectionList : finishedElectionList;
    const currentListName = isOngoing ? "ongoing" : "finished";

    // 비로그인 회원의 경우에는 체험하기를 하게한다.
    if (!isLogin)
        <Message
            message="로그인 후, 대학 인증을 하면
                    선거함을 이용할 수 있어요."
            link="election/test"
            buttonValue="체험하기"
        />;

    // 비학교인증 회원의 경우에는 체험하기를 하게한다.
    {
        isLogin && !isSchoolAuth && (
            <Message
                message="대학 인증을 하면
                    선거함을 이용할 수 있어요."
                link="election/test"
                buttonValue="체험하기"
            />
        );
    }

    return (
        <ElectionContainer>
            <Helmet>
                <title>UFO - 투표함</title>
            </Helmet>
            <Title isDarkTheme={isDarkTheme}>투표함</Title>
            <Controls isDarkTheme={isDarkTheme}>
                <Selecter>
                    <DefaultSelector
                        isSelected={isOngoing}
                        rightGap={theme.calRem(8)}
                        onClick={() => setIsOngoing(true)}
                    >
                        진행중선거
                    </DefaultSelector>
                    <DefaultSelector
                        isSelected={!isOngoing}
                        onClick={() => setIsOngoing(false)}
                    >
                        종료된선거
                    </DefaultSelector>
                </Selecter>
                <DefaultButton onClick={() => history.push(`/election/write`)}>
                    추가하기
                </DefaultButton>
            </Controls>

            {/* 로그인회원, 학교인증 회원, 선거게시글이 있는 경우에는 선거목록을 보여준다. */}
            {isLogin &&
            isSchoolAuth &&
            currentList &&
            currentList.length < 1 ? (
                <Message
                    message="아직 선거가 없습니다"
                    link="election/test"
                    buttonValue="체험하기"
                />
            ) : (
                <>
                    <GridContainer>
                        {currentListName === "ongoing"
                            ? currentList.map(ele => (
                                  <OngoingPost
                                      isDarkTheme={isDarkTheme}
                                      key={ele.election_id}
                                      isVoted={ele.votes.length > 0}
                                      onClick={() =>
                                          history.push(
                                              `/election/detail/${ele.election_id}`,
                                          )
                                      }
                                  >
                                      <span>{ele.name}</span>
                                      {ele.votes.length > 0 && (
                                          <VotingComplete
                                              isDarkTheme={isDarkTheme}
                                          >
                                              투표 완료!
                                          </VotingComplete>
                                      )}
                                  </OngoingPost>
                              ))
                            : currentList.map(ele => (
                                  <FinishedPost
                                      isDarkTheme={isDarkTheme}
                                      key={ele.election_id}
                                      isVoted={ele.votes.length > 0}
                                      onClick={() =>
                                          history.push(
                                              `/election/detail/${ele.election_id}`,
                                          )
                                      }
                                  >
                                      <span>{ele.name}</span>
                                      {ele.votes.length > 0 && (
                                          <VotingComplete
                                              isDarkTheme={isDarkTheme}
                                          >
                                              투표 완료!
                                          </VotingComplete>
                                      )}
                                  </FinishedPost>
                              ))}
                    </GridContainer>
                </>
            )}
        </ElectionContainer>
    );
};

const ElectionContainer = styled.div``;

const Title = styled.div`
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "gray1" : "gray4",
            "bottom",
        )};
    padding-bottom: ${({ theme }) => theme.calRem(10)};
    margin-bottom: ${({ theme }) => theme.calRem(10)};
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
        padding-bottom: ${({ theme }) => theme.calRem(8)};
        margin-bottom: ${({ theme }) => theme.calRem(8)};
    }
`;

const Controls = styled.div`
    ${mixin.flexBox("space-between", "flex-end")};
    padding-bottom: ${({ theme }) => theme.calRem(10)};
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "gray1" : "gray4",
            "bottom",
        )};
    @media ${({ theme }) => theme.mobile} {
        padding-bottom: ${({ theme }) => theme.calRem(8)};
    }
`;

const Selecter = styled.div``;

const GridContainer = styled.div`
    padding: ${({ theme }) => theme.calRem(16)} 0;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: ${({ theme }) => theme.calRem(30)} ${({ theme }) => theme.calRem(25)};
    @media ${({ theme }) => theme.mobile} {
        grid-template-columns: repeat(2, 1fr);
        gap: ${({ theme }) => theme.calRem(16)};
    }
`;

const OngoingPost = styled.div`
    overflow: hidden;
    border-radius: 50px;
    cursor: pointer;
    ${props => (props.isDarkTheme ? mixin.darkBoxShadow() : mixin.boxShadow())};
    padding: ${({ theme }) => `${theme.calRem(20)} ${theme.calRem(25)}`};
    ${mixin.outline("3px solid", "blue2")}
    ${mixin.flexBox("center", "center", null, `${theme.calRem(100)}`)};
    ${mixin.floatBox("relative")}
    ${props =>
        props.isVoted
            ? mixin.outline("3px solid", "gray1")
            : mixin.outline("3px solid", "blue2")};

    @media ${({ theme }) => theme.mobile} {
        height: ${theme.calRem(60)};
    }

    :hover {
        ${props =>
            props.isDarkTheme ? "" : mixin.outline("3px solid", "gray1")};
    }

    span {
        ${props =>
            mixin.textProps(
                20,
                "extraBold",
                props.isDarkTheme ? "mainGray" : "gray1",
            )}
        ${mixin.textboxOverflow(2)}

        @media ${({ theme }) => theme.mobile} {
            ${props =>
                mixin.textProps(
                    16,
                    "extraBold",
                    props.isDarkTheme ? "mainGray" : "gray1",
                )}
            ${mixin.textboxOverflow(1)}
        }
    }
`;

const FinishedPost = styled.div`
    overflow: hidden;
    border-radius: 50px;
    cursor: pointer;
    ${props => (props.isDarkTheme ? mixin.darkBoxShadow() : mixin.boxShadow())};
    padding: ${({ theme }) => `${theme.calRem(20)} ${theme.calRem(25)}`};
    background: ${props =>
        props.isDarkTheme
            ? props.theme.color.gray1
            : props.theme.color.mainGray};
    ${mixin.outline("3px solid", "gray3")}
    ${mixin.flexBox("center", "center", null, `${theme.calRem(100)}`)};
    ${mixin.floatBox("relative")}
    ${props => (props.isVoted ? mixin.outline("3px solid", "gray2") : "")}
        @media ${({ theme }) => theme.mobile} {
        height: ${theme.calRem(60)};
    }

    span {
        ${mixin.textboxOverflow(2)};
        ${props =>
            mixin.textProps(
                20,
                "regular",
                props.isDarkTheme ? "mainGray" : "gray2",
            )};
        @media ${({ theme }) => theme.mobile} {
            ${props =>
                mixin.textProps(
                    16,
                    "regular",
                    props.isDarkTheme ? "mainGray" : "gray2",
                )};
            ${mixin.textboxOverflow(1)};
        }
    }

    :hover {
        background: ${props =>
            props.isDarkTheme
                ? props.theme.color.black
                : props.theme.color.white};
        ${mixin.outline("3px solid", "danger")};
        span {
            ${props =>
                mixin.textProps(
                    20,
                    "regular",
                    props.isDarkTheme ? "mainGray" : "gray1",
                )};
            @media ${({ theme }) => theme.mobile} {
                ${props =>
                    mixin.textProps(
                        16,
                        "regular",
                        props.isDarkTheme ? "mainGray" : "gray1",
                    )};
                ${mixin.textboxOverflow(1)};
            }
        }
    }
`;

const VotingComplete = styled.div`
    ${mixin.floatBox("absolute")}
    width: 100%;
    background: rgba(0, 0, 0, 0.55);
    ${mixin.textProps(20, "regular", "mainMint")}
    ${mixin.flexBox("center", "center")};
    :hover {
        opacity: 0;
    }

    @media ${({ theme }) => theme.mobile} {
        ${mixin.textProps(16, "regular", "mainMint")}
    }
`;

export default Election;
