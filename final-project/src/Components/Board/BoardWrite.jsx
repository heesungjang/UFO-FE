import React, { useState, useEffect } from "react";
import styled from "styled-components";
import mixin from "../../Styles/Mixin";
import categories from "../../Shared/categories";
import { useSelector, useDispatch } from "react-redux";
import { history } from "../../Redux/configureStore";
import { useParams } from "react-router";
import theme from "../../Styles/theme";

//통신
import { freeBoardApi, univBoardApi } from "../../Shared/api";
import { addFreePostDB, editFreePostDB } from "../../Redux/Async/freeBoard";
import {
    addUnivBoardPostDB,
    editUnivBoardPostDB,
} from "../../Redux/Async/univBoard";

//애니메이션
import Boop from "../../Elements/Animations/Boop";

//alert
import Swal from "sweetalert2";

//컴포넌트
import Editor from "./Editor";
import DefaultButton from "../../Elements/Buttons/DefaultButton";
import DefaultSelector from "../../Elements/Buttons/DefaultSelector";
import AnnounceSelector from "../../Elements/Buttons/AnnounceSelector";
import Message from "../Shared/Message";

/**
 * @author jiyeong
 * @param  boardName:게시판명
 * @returns 자유게시판 게시글 작성페이지 or 자유게시판 특정 게시글 수정페이지
 * @역할 props.match.params.id이 없으면 게시글 작성페이지, 있으면 수정페이지로 렌더링.
 * @필수값 boardName:게시판명, postId:포스트아이디, user:유저정보
 */

const BoardWrite = ({ boardName }) => {
    const dispatch = useDispatch();
    const { id: postId } = useParams();
    const isEdit = postId ? true : false; //수정모드인지 아닌지 판별 state
    const isAdmin = useSelector(state => state.user.isAdmin); //관리자인지 아닌지에 대한 판별 state
    const isLoggedIn = useSelector(state => state.user.isLoggedIn); //로그인했는지 안했는지 판별 state
    const user = useSelector(state => state.user.user); //유저정보
    const [post, setPost] = useState(null); //이 state는 입력값들이 들어갈 곳입니다!
    const [isAnnouncement, setIsAnnouncement] = useState(false); // 게시물 공지 설정 값
    const isDarkTheme = useSelector(state => state.user.isDarkTheme); //다크모드인지 아닌지 판별 state

    const getContentFromEditor = content => {
        //에디터로부터 content 값 가져오기
        setPost({ ...post, content: content });
    };

    //┏-----------------게시글 수정파트-----------------┓
    //----state에 있는 post 정보 불러오기. boardName이 freeboard면 자유게시판, 아니면 대학게시판을 가져온다.
    const postFromState = useSelector(state =>
        boardName === "freeboard" ? state.freeBoard.post : state.univBoard.post,
    );

    const goBackPostDetail = () => {
        //뒤로가기를 누르면 원래 상세페이지로 돌아갑니다.
        if (boardName === "freeboard")
            history.push(`/freeboard/detail/${postId}`);
        if (boardName === "univboard")
            history.push(`/univboard/detail/${postId}`);
    };

    //----state로부터 post값을 얻어올 수 있으면 중지하고, 아니면 서버로부터 post값을 받아온다.
    useEffect(() => {
        if (postId && postFromState) setPost(postFromState); //디테일페이지에 갔다가 수정페이지에오면 디테일페이지에 있는 내용들이 state에 실리게 되어서 마운트가 되고, 원본값을 넣기로 함!
        if (postId && !postFromState) {
            //만약 스테이트에 post값이 없으면, api 요청해서 바로 값을 가져와서 post에 집어넣어준다.
            if (boardName === "freeboard")
                freeBoardApi
                    .getPost(postId)
                    .then(res => setPost(res.data.result));
            if (boardName === "univboard") {
                univBoardApi
                    .getPostDetail(postId)
                    .then(res => setPost(res.data.result));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    //----

    const editfreePost = () => {
        //서버에 필요한 정보를 정리하고, 포스트를 수정하는 미들웨어 함수로 보낸다.
        if (!user.user_id)
            return Swal.fire("에러", "로그인을 해주세요!", "error");
        if (user.user_id && user.user_id !== post.user_id)
            return Swal.fire("에러", "일치하는 사용자가 아니예요!", "error");
        if (user.user_id && !post?.title)
            return Swal.fire("에러", "제목을 적어주세요!", "error");
        if (user.user_id && typeof post?.content === "object")
            //CKEditor 특성상 입력값 없음은 객체다.
            return Swal.fire("에러", "내용을 적어주세요!", "error");

        //----본문에서 유저가 실제로 사용하는 이미지 url목록들을 솎아냅니다.
        const imgList = getImgList(post.content);

        if (boardName === "freeboard") {
            const req = {
                title: post.title,
                category: post.category,
                content: post.content,
                country_id: post.country_id,
                post_id: post.post_id,
                img_list: imgList,
            };

            history.push(`/freeboard/detail/${postId}`);
            dispatch(editFreePostDB(req));
        }

        if (boardName === "univboard") {
            const req = {
                title: post.title,
                category: post.category,
                content: post.content,
                post_id: post.post_id,
                is_fixed: post.is_fixed,
                univ_id: user.univ_id,
                img_list: imgList,
            };
            dispatch(editUnivBoardPostDB(req));
            history.push(`/univboard/detail/${postId}`);
        }
    };
    //┗-----------------게시글 수정파트-----------------┛

    //┏-----------------게시글 작성파트-----------------┓

    //---- boardName이 freeboard면 자유게시판카테고리를 가져오고, 아니면 대학카테고리를 가져온다.
    const categoryList =
        boardName === "freeboard"
            ? categories.freeCategory
            : categories.univCategory;
    //----

    const goBoard = () => {
        //뒤로가기를 누르면 원래 게시판페이지로 돌아갑니다.
        if (boardName === "freeboard") history.push(`/freeboard`);
        if (boardName === "univboard") history.push(`/univboard`);
    };

    const setCategory = (keyName, value) => {
        // 선택한 카테고리 값을 가져와서 setPost해주는 함수입니다.
        setPost({
            ...post,
            [keyName]: value,
        });
    };

    const getImgList = content => {
        //에디터에서 받아온 컨텐츠 내용을 파싱하여 유저가 실제로 사용하는 이미지만을 솎아내는 함수입니다.
        const apiUrl = "https://yzkim9501.site";
        if (content.includes(apiUrl)) {
            let result = [];
            let _imgList = content.split(apiUrl).slice(1);
            for (let i = 0; i < _imgList.length; i++) {
                const startIdx = _imgList[i][0];
                const endIdx = _imgList[i].indexOf(">") - 1;
                const imgSrc = _imgList[i].slice(startIdx, endIdx);
                result.push(imgSrc);
            }
            return result;
        }
    };

    const addPost = () => {
        //서버에 필요한 정보를 정리하고, 포스트를 추가하는 미들웨어 함수로 보낸다.
        if (!user.user_id)
            return Swal.fire("에러", "로그인을 해주세요!", "error");
        if (user.user_id && !post.category)
            return Swal.fire(
                "에러",
                "게시글의 카테고리 태그를 설정해주세요.",
                "error",
            );
        if (user.user_id && !post.title)
            return Swal.fire("에러", "제목을 작성해주세요.", "error");
        if (user.user_id && !post.content)
            return Swal.fire("에러", "내용을 작성해주세요.", "error");

        //----본문에서 유저가 실제로 사용하는 이미지 url목록들을 솎아냅니다.
        const imgList = getImgList(post.content);

        if (boardName === "freeboard") {
            if (user.user_id && !post.country_id)
                return Swal.fire(
                    "에러",
                    "게시글의 국가 태그를 설정해주세요.",
                    "error",
                );

            const req = {
                title: post.title,
                category: post.category,
                content: post.content,
                country_id: post.country_id,
                img_list: imgList,
            };
            dispatch(addFreePostDB(req));
            history.push("/freeboard");
        }
        if (boardName === "univboard") {
            const req = {
                title: post.title,
                category: post.category,
                content: post.content,
                is_fixed: isAnnouncement,
                univ_id: user.univ_id,
                img_list: imgList,
            };
            dispatch(addUnivBoardPostDB(req));
            history.push("/univboard");
        }
    };

    //로그인안한 유저 핸들링
    if (!isLoggedIn)
        return (
            <Message
                strong="로그인"
                message="을 해야만 글을 작성할 수 있어요!"
                link="/login"
                buttonValue="로그인하러가기"
            />
        );

    //학교인증안한 유저 핸들링
    if (boardName === "univboard" && !user.school_auth)
        return (
            <Message
                strong="대학인증"
                message="을 해야만 글을 작성할 수 있어요!"
                link="/mypage"
                buttonValue="대학인증하러가기"
            />
        );

    if (isEdit && post) {
        //┗-----------------게시글 작성파트-----------------┛
        return (
            //게시글 수정모드
            <>
                {/* 게시판제목 */}
                <BoardTitle isDarkTheme={isDarkTheme} onClick={goBoard}>
                    <h3>
                        {boardName === "freeboard"
                            ? "자유게시판"
                            : "대학게시판"}
                    </h3>
                </BoardTitle>
                <InputTitle
                    isDarkTheme={isDarkTheme}
                    placeholder="제목을 입력해주세요!"
                    onChange={e => setPost({ ...post, title: e.target.value })}
                    value={post.title}
                />
                <Editor
                    isDarkTheme={isDarkTheme}
                    originContent={post.content}
                    getContentFromEditor={getContentFromEditor}
                />

                <Controls>
                    <DefaultButton rightGap="10px" onClick={goBackPostDetail}>
                        취소
                    </DefaultButton>
                    <DefaultButton onClick={editfreePost}>수정</DefaultButton>
                </Controls>
            </>
        );
    }
    return (
        // 게시글 작성모드
        <>
            {/* 게시판제목 */}
            <BoardTitle isDarkTheme={isDarkTheme} onClick={goBoard}>
                <h3>
                    {boardName === "freeboard" ? "자유 게시판" : "대학 게시판"}
                </h3>
            </BoardTitle>

            {/* 태그선택 */}
            <SelectBox>
                {boardName === "freeboard" && (
                    <CountrySelect isDarkTheme={isDarkTheme}>
                        {/* 자유게시판이면 국가선택란이 나타난다. */}
                        <TagSelectTextBox isDarkTheme={isDarkTheme}>
                            <SelectTitle isDarkTheme={isDarkTheme}>
                                국가 설정
                            </SelectTitle>
                        </TagSelectTextBox>
                        <TagSelectorBox>
                            {categories.country.map(ele => (
                                <DefaultSelector
                                    isSelected={
                                        post?.country_id === ele.countryId
                                    }
                                    key={ele.countryId}
                                    rightGap="10px"
                                    lastNoGap
                                    onClick={() =>
                                        setCategory("country_id", ele.countryId)
                                    }
                                >
                                    {ele.countryName}
                                </DefaultSelector>
                            ))}
                        </TagSelectorBox>
                    </CountrySelect>
                )}
                <TagSelect isDarkTheme={isDarkTheme}>
                    {/* 카테고리 중  선택하기 */}
                    <TagSelectTextBox isDarkTheme={isDarkTheme}>
                        <SelectTitle isDarkTheme={isDarkTheme}>
                            태그 설정
                        </SelectTitle>
                    </TagSelectTextBox>
                    <TagSelectorBox>
                        {categoryList.map((ele, idx) => (
                            <Boop
                                rotation={0}
                                timing={200}
                                x={0}
                                y={-7}
                                key={idx}
                            >
                                <DefaultSelector
                                    isSelected={
                                        Number(post?.category) ===
                                        ele.categoryId
                                    }
                                    key={ele.categoryId}
                                    rightGap="8px"
                                    lastNoGap={categoryList.length - 1 === idx}
                                    onClick={() =>
                                        setCategory(
                                            "category",
                                            `${ele.categoryId}`,
                                        )
                                    }
                                >
                                    #{ele.categoryName}
                                </DefaultSelector>
                            </Boop>
                        ))}
                    </TagSelectorBox>
                </TagSelect>
                {boardName === "univboard" && isAdmin && (
                    <AnnounceSelect>
                        {/* 카테고리 중 카테고리 선택하기 */}
                        <SelectTitle isDarkTheme={isDarkTheme}>
                            공지 설정
                        </SelectTitle>
                        <AnnounceSelector
                            isSelected={isAnnouncement}
                            rightGap="10px"
                            lastNoGap
                            onClick={() => setIsAnnouncement(!isAnnouncement)}
                        >
                            공지글
                        </AnnounceSelector>
                    </AnnounceSelect>
                )}
            </SelectBox>

            {/* 제목입력란 */}
            <InputTitle
                isDarkTheme={isDarkTheme}
                placeholder="제목을 입력해주세요!"
                onChange={e => setPost({ ...post, title: e.target.value })}
            />

            {/* 컨텐츠입력란 (에디터) */}
            <Editor
                getContentFromEditor={getContentFromEditor}
                isDarkTheme={isDarkTheme}
            />

            {/* 컨트롤 버튼 */}
            <Controls>
                <DefaultButton rightGap="15px" onClick={goBoard}>
                    취소
                </DefaultButton>
                <DefaultButton onClick={addPost}>등록</DefaultButton>
            </Controls>
        </>
    );
};

const BoardTitle = styled.div`
    cursor: pointer;
    ${mixin.outline("1px solid", "gray4", "bottom")};
    ${props => props.isDarkTheme && `border-color:${props.theme.color.gray1};`}

    h3 {
        ${props =>
            mixin.textProps(
                30,
                "extraBold",
                props.isDarkTheme ? "white" : "black",
            )};
        margin-bottom: ${theme.calRem(10)};
        @media ${({ theme }) => theme.mobile} {
            ${props =>
                mixin.textProps(
                    22,
                    "extraBold",
                    props.isDarkTheme ? "white" : "black",
                )};
            margin-bottom: ${theme.calRem(8)};
        }
    }
`;

const SelectBox = styled.div``;

const TagSelectTextBox = styled.div`
    @media ${({ theme }) => theme.mobile} {
        position: absolute;
        z-index: 10;
        background: ${props =>
            props.isDarkTheme
                ? props.theme.color.black
                : props.theme.color.white};
        height: ${theme.calRem(42)};
        line-height: 42px;
    }
`;

const SelectTitle = styled.span`
    display: inline-block;
    width: 60px;
    ${props =>
        mixin.textProps(14, "semiBold", props.isDarkTheme ? "gray2" : "gray3")}
    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                11,
                "semiBold",
                props.isDarkTheme ? "gray2" : "gray3",
            )}
    }
`;

const TagSelectorBox = styled.div`
    @media ${({ theme }) => theme.mobile} {
        width: 100%;
        white-space: nowrap;
        overflow: auto;
        padding-left: ${({ theme }) => theme.calRem(60)};
        ${mixin.flexBox(null, "center", null, theme.calRem(42))}
        ::-webkit-scrollbar {
            display: none;
        }
    }
`;

const CountrySelect = styled.div`
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "gray1" : "gray4",
            "bottom",
        )}

    ${mixin.flexBox(null, "center")}
    padding:${({ theme }) => theme.calRem(15)} 0;
    @media ${({ theme }) => theme.mobile} {
        padding: 0;
    }
`;

const TagSelect = styled.div`
    padding: ${({ theme }) => theme.calRem(15)} 0;
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "gray1" : "gray4",
            "bottom",
        )}

    ${mixin.flexBox(null, "center")}
        @media ${({ theme }) => theme.mobile} {
        //TagSelect는 모바일로 갔을 때 오른쪽으로 스와이프하는 기능때문에 padding을 초기화시켜줘야한다.
        padding: 0;
    }
`;

const AnnounceSelect = styled.div`
    padding: ${({ theme }) => theme.calRem(15)} 0;
    @media ${({ theme }) => theme.mobile} {
        padding: ${({ theme }) => theme.calRem(8)} 0;
    }
`;

const InputTitle = styled.input`
    all: unset;
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "black" : "gray4",
            "bottom",
        )};
    ${props =>
        mixin.textProps(
            30,
            "extraBold",
            props.isDarkTheme ? "mainGray" : "black",
        )};
    transition: border-bottom 1s ease;
    padding: ${theme.calRem(20)} 0;
    width: 100%;
    transition: border-bottom 1s ease;
    :focus {
        ${props =>
            mixin.outline(
                "1px solid",
                props.isDarkTheme ? "mainGray" : "black",
                "bottom",
            )};
    }
    ::placeholder {
        ${props =>
            mixin.textProps(
                30,
                "extraBold",
                props.isDarkTheme ? "gray1" : "mainGray",
            )};
        @media ${({ theme }) => theme.mobile} {
            ${mixin.textProps(22, "extraBold", "mainGray")};
        }
    }

    @media ${({ theme }) => theme.mobile} {
        padding: ${theme.calRem(16)} 0;
        ${props =>
            mixin.textProps(
                22,
                "extraBold",
                props.isDarkTheme ? "white" : "black",
            )};
    }
`;

const Controls = styled.div`
    margin-top: ${theme.calRem(30)};
    display: flex;
    justify-content: center;
    @media ${({ theme }) => theme.mobile} {
        margin-top: ${theme.calRem(16)};
    }
`;

export default BoardWrite;
