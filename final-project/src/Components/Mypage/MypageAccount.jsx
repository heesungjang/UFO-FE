import React, { useState } from "react";
import styled from "styled-components";
import mixin from "../../Styles/Mixin";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import randomString from "randomstring";
import Swal from "sweetalert2";

//통신
import { userApi } from "../../Shared/api";
import { logoutUser, updateUsername } from "../../Redux/Modules/userSlice";

import confirm from "../../Shared/confirm";

const MypageAccount = props => {
    const dispatch = useDispatch();
    const isDarkTheme = useSelector(state => state.user.isDarkTheme);

    const user = useSelector(state => state.user.user); // 로그인 유저 정보

    // 서버에서 유저에게 발송하는 이메일 인증 코드 저장
    const [authCode, setAuthCode] = useState(randomString.generate(7));
    // 이메일 인증 성공 메세지
    const [emailAuthMsg, setEmailAuthMsg] = useState("");
    // 버튼의 클릭 유뮤로 styled component의 색상을 변경해주기 위한 상태 값
    const [selectedButton, setSelectedButton] = useState("");
    // 유저가 선택한 버튼에 맞는 수정 입력창의 보여주기 위한 상태 값
    const [isSchoolEditMode, setIsSchoolEditMode] = useState(false);
    // 유저가 입력한 학교 이메일
    const [inputEmail, setInputEmail] = useState("");
    // 학교 인증코드 verification 메세지
    const [authCodeMsg, setAuthCodeMsg] = useState("");
    // 닉네임 변경 모드인지 확인하는 상태 값
    const [isNicknameEditMode, setIsNicknameEditMode] = useState(false);
    // 로그인 이메일 변경 모드 확인하는 상태 값
    const [isLoginEmailEditMode, setIsLoginEmailEditMode] = useState(false);
    // 비밀번호 설정 모드 값
    const [isResetPasswordEditMode, setIsResetPasswordEditMode] =
        useState(false);

    // 버튼 클릭 핸들러
    const handleButtonClick = event => {
        // 선택된 버튼 (유저가 클리한 버튼)
        const {
            target: { name: buttonName },
        } = event;
        // 유저가 버튼을 클릭했는지 선택 유무 설정
        if (buttonName !== selectedButton) {
            setSelectedButton(buttonName);
        } else {
            setSelectedButton("");
        }
    };
    // 이메일 인증 모드 핸들러
    const handleSchoolAuth = e => {
        setIsNicknameEditMode(false);
        setIsLoginEmailEditMode(false);
        setIsSchoolEditMode(!isSchoolEditMode);
    };
    // 닉네임 변경 모드 핸들러
    const handleNicknameEditMode = e => {
        setIsSchoolEditMode(false);
        setIsLoginEmailEditMode(false);
        setIsResetPasswordEditMode(false);
        setIsNicknameEditMode(!isNicknameEditMode);
    };
    // 로그인 이메일 변경 모드 핸들러
    const handleLoginEmailEditMode = e => {
        setIsSchoolEditMode(false);
        setIsNicknameEditMode(false);
        setIsResetPasswordEditMode(false);
        setIsLoginEmailEditMode(!isLoginEmailEditMode);
    };
    // 비밀번호 설정 모드 핸들러
    const handlePasswordResetMode = e => {
        setIsSchoolEditMode(false);
        setIsLoginEmailEditMode(false);
        setIsNicknameEditMode(false);
        setIsResetPasswordEditMode(!isResetPasswordEditMode);
    };
    // 계정 삭제 핸들러
    const handleDeleteAccount = () => {
        const deleteAccountDB = async () => {
            await userApi.deleteAccount(user.user_id).then(res => {
                if (res.data.ok) {
                    Swal.fire("완료", "회원 탈퇴 성공", "success");
                    dispatch(logoutUser());
                }
            });
        };

        confirm.deleteConfirm(deleteAccountDB);
    };
    // 이메일 인증 유효성 formik & submit handler
    const emailAuthFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("이메일 형식을 확인해주세요.")
                .required("이메일을 입력해주세요."),
        }),
        onSubmit: async ({ email }, actions) => {
            await userApi
                .verifyUniEmail(email)
                .then(res => {
                    setAuthCode(res.data.authCode);
                    setInputEmail(email);
                    setEmailAuthMsg("인증번호가 전송되었습니다.");
                    
                    actions.resetForm(authCodeFormik.initialValues);
                })
                .catch(error => {
                    if (
                        error.response.data.message === "already existing email"
                    ) {
                        setEmailAuthMsg("이미 사용중인 이메일입니다.");
                    } else if (
                        error.response.data.message ===
                        "not supported university"
                    ) {
                        setEmailAuthMsg("현재 지원하지 않는 대학교입니다.");
                    }
                });
        },
    });
    // 인증 코드 유효성 확인 && onSubmit handler
    const authCodeFormik = useFormik({
        initialValues: {
            inputAuthCode: "",
        },
        validationSchema: Yup.object({
            inputAuthCode: Yup.number()
                .required("인증번호를 입력해주세요.")
                .typeError("인증번호는 숫자만 입력가능합니다."),
        }),
        onSubmit: async ({ inputAuthCode }, actions) => {
            if (inputAuthCode === authCode) {
                const req = {
                    email: inputEmail,
                    user_id: user?.user_id,
                };
                await userApi.checkVerifyCode(req).then(async res => {
                    if (res.data.result === "university authorized") {
                        actions.resetForm(authCodeFormik.initialValues);
                        setAuthCodeMsg("이메일 인증 성공");
                        Swal.fire("완료", "이메일 인증 성공", "success");
                        setEmailAuthMsg("");
                        setSelectedButton("");
                        setIsSchoolEditMode(false);
                    }
                });
            } else if (inputAuthCode !== authCode) {
                setAuthCodeMsg("인증코드를 확인하세요.");
            }
        },
    });
    // 닉네임 변경 formik && onSubmit handler
    const nicknameChangeFormik = useFormik({
        initialValues: {
            nickname: "",
            password: "",
        },
        validationSchema: Yup.object({
            nickname: Yup.string()
                .max(10, "닉네임은 10자리 미만으로 입력해주세요.")
                .required("닉네임을 입력해주세요"),

            password: Yup.string().required("비밀번호를 입력하세요"),
        }),
        onSubmit: async ({ nickname, password }, actions) => {
            const req = {
                userId: user.user_id,
                nickname,
                password,
            };
            await userApi
                .editUserProfile(req)
                .then(res => {
                    if (res.data.ok) {
                        dispatch(updateUsername(nickname && nickname));
                        Swal.fire("완료", "닉네임 변경 완료", "success");
                        actions.resetForm(nicknameChangeFormik.initialValues);
                        setSelectedButton("");
                        setIsNicknameEditMode(false);
                    }
                })
                .catch(error => {
                    if (error.response.data.message === "닉네임 중복") {
                        nicknameChangeFormik.errors.nickname =
                            "이미 사용중인 닉네임입니다.";
                    }
                    if (
                        error.response.data.message === "비밀번호가 틀렸습니다."
                    ) {
                        nicknameChangeFormik.errors.password =
                            error.response.data.message;
                    }
                });
        },
    });
    // 로그인 이메일 변경 formik && onSubmit handler
    const loginEmailFormik = useFormik({
        initialValues: {
            password: "",
            newEmail: "",
        },
        validationSchema: Yup.object({
            newEmail: Yup.string()
                .required("이메일을 입력해주세요.")
                .email("이메일 형식을 확인해주세요."),
            password: Yup.string().required("비밀번호를 입력하세요"),
        }),
        onSubmit: async ({ newEmail, password }, actions) => {
            const req = {
                email: newEmail,
                password,
                userId: user.user_id,
            };
            await userApi
                .editUserProfile(req)
                .then(res => {
                    if (res.data.ok) {
                        actions.resetForm(loginEmailFormik.initialValues);
                        setSelectedButton("");
                        setIsLoginEmailEditMode(false);
                        Swal.fire("완료", "이메일 변경 완료", "success");
                    }
                })
                .catch(error => {
                    if (
                        error.response.data.message === "비밀번호가 틀렸습니다."
                    ) {
                        loginEmailFormik.errors.password =
                            error.response.data.message;
                    } else if (error.response.data.message === "이메일 중복") {
                        loginEmailFormik.errors.newEmail =
                            error.response.data.message;
                    }
                });
        },
    });
    // 비밀번호 재설정 formik && onSubmit handler
    const passwordResetFormik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: "",
        },
        validationSchema: Yup.object({
            currentPassword:
                Yup.string().required("현재 비빌번호를 입력해주세요"),
            newPassword:
                Yup.string().required("새로운 비빌번호를 입력해주세요 "),

            newPasswordConfirm: Yup.string()
                .required("비밀번호 확인을 입력해주세요.")
                .oneOf(
                    [Yup.ref("newPassword"), null],
                    "비밀번호가 같지 않습니다.",
                ),
        }),
        onSubmit: async (
            { currentPassword, newPassword, newPasswordConfirm },
            actions,
        ) => {
            const req = {
                password: currentPassword,
                newPassword: newPassword,
                userId: user.user_id,
            };
            await userApi
                .editUserProfile(req)
                .then(res => {
                    if (res.data.ok) {
                        actions.resetForm(passwordResetFormik.initialValues);
                        setSelectedButton("");
                        setIsResetPasswordEditMode(false);
                        Swal.fire("완료", "비밀번호 변경 성공", "success");
                    }
                })
                .catch(error => {
                    if (
                        error.response.data.message === "비밀번호가 틀렸습니다."
                    ) {
                        passwordResetFormik.errors.currentPassword =
                            "비밀번호가 틀렸습니다.";
                    }
                });
        },
    });

    return (
        <>
            <TitleWrapper isDarkTheme={isDarkTheme}>
                <Title isDarkTheme={isDarkTheme}>계정관리</Title>
            </TitleWrapper>
            <ControlContainer>
                <ButtonWrapper>
                    {/* 이메일 인증  모드 핸들러 버튼 */}
                    <ControlButton
                        isDarkTheme={isDarkTheme}
                        name="schoolButton"
                        onClick={e => {
                            handleButtonClick(e);
                            handleSchoolAuth(e);
                        }}
                        selected={selectedButton}
                    >
                        학교 인증
                    </ControlButton>
                </ButtonWrapper>
                {/* 이메일 인증 formik validation && input 창 */}
                {isSchoolEditMode && (
                    <InputContainer>
                        <FirstInputForm onSubmit={emailAuthFormik.handleSubmit}>
                            <FirstInputWrapper>
                                <FirstButtonContainer>
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        id="email"
                                        placeholder="대학 이메일을 입력해주세요"
                                        {...emailAuthFormik.getFieldProps(
                                            "email",
                                        )}
                                        onBlur={emailAuthFormik.handleBlur}
                                    />
                                    <InputButton
                                        isDarkTheme={isDarkTheme}
                                        type="submit"
                                    >
                                        확인
                                    </InputButton>
                                </FirstButtonContainer>
                                {emailAuthMsg === "" &&
                                emailAuthFormik.touched.email &&
                                emailAuthFormik.errors.email ? (
                                    <ErrorBox>
                                        {emailAuthFormik.errors.email}
                                    </ErrorBox>
                                ) : null}
                                {emailAuthMsg ? (
                                    <ErrorBox>{emailAuthMsg}</ErrorBox>
                                ) : null}
                            </FirstInputWrapper>
                        </FirstInputForm>

                        <InputForm onSubmit={authCodeFormik.handleSubmit}>
                            <InputWrapper>
                                <ButtonContainer>
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        id="inputAuthCode"
                                        placeholder="인증번호를 입력해주세요"
                                        {...authCodeFormik.getFieldProps(
                                            "inputAuthCode",
                                        )}
                                    />
                                    <FirstInputButton
                                        isDarkTheme={isDarkTheme}
                                        type="submit"
                                    >
                                        인증
                                    </FirstInputButton>
                                </ButtonContainer>
                                {authCodeMsg === "" &&
                                authCodeFormik.touched.inputAuthCode &&
                                authCodeFormik.errors.inputAuthCode ? (
                                    <ErrorBox>
                                        {authCodeFormik.errors.inputAuthCode}
                                    </ErrorBox>
                                ) : null}
                                {authCodeFormik.touched.inputAuthCode &&
                                authCodeMsg ? (
                                    <ErrorBox>{authCodeMsg}</ErrorBox>
                                ) : null}
                            </InputWrapper>
                        </InputForm>
                    </InputContainer>
                )}
                {/* 닉네임 변경 모드 핸들러 버튼 */}
                <ControlButton
                    isDarkTheme={isDarkTheme}
                    name="nicknameButton"
                    onClick={e => {
                        handleButtonClick(e);
                        handleNicknameEditMode(e);
                    }}
                    selected={selectedButton}
                >
                    닉네임 설정
                </ControlButton>
                {/* 닉네임 변경 formik validation && input 창 */}
                {isNicknameEditMode && (
                    <InputContainer>
                        <InputForm onSubmit={nicknameChangeFormik.handleSubmit}>
                            <InputWrapper>
                                <Input
                                    isDarkTheme={isDarkTheme}
                                    id="password"
                                    type="password"
                                    placeholder="비밀번호를 입력해주세요."
                                    {...nicknameChangeFormik.getFieldProps(
                                        "password",
                                    )}
                                />
                                {nicknameChangeFormik.touched.password &&
                                nicknameChangeFormik.errors.password ? (
                                    <ErrorBox>
                                        {nicknameChangeFormik.errors.password}
                                    </ErrorBox>
                                ) : null}
                                <ButtonContainer>
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        id="nickname"
                                        placeholder="변경할 닉네임을 입력해주세요."
                                        {...nicknameChangeFormik.getFieldProps(
                                            "nickname",
                                        )}
                                    />

                                    <InputButton
                                        isDarkTheme={isDarkTheme}
                                        type="submit"
                                    >
                                        확인
                                    </InputButton>
                                </ButtonContainer>
                                {nicknameChangeFormik.touched.nickname &&
                                nicknameChangeFormik.errors.nickname ? (
                                    <ErrorBox>
                                        {nicknameChangeFormik.errors.nickname}
                                    </ErrorBox>
                                ) : null}
                            </InputWrapper>
                        </InputForm>
                    </InputContainer>
                )}
                <ButtonWrapper>
                    <ControlButton
                        isDarkTheme={isDarkTheme}
                        name="emailButton"
                        onClick={e => {
                            handleLoginEmailEditMode(e);
                            handleButtonClick(e);
                        }}
                        selected={selectedButton}
                    >
                        로그인 이메일 변경
                    </ControlButton>
                    {isLoginEmailEditMode && (
                        <InputContainer>
                            <InputForm onSubmit={loginEmailFormik.handleSubmit}>
                                <InputWrapper>
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="비밀번호를 입력해주세요."
                                        {...loginEmailFormik.getFieldProps(
                                            "password",
                                        )}
                                    />

                                    {loginEmailFormik.touched.password &&
                                    loginEmailFormik.errors.password ? (
                                        <ErrorBox>
                                            {loginEmailFormik.errors.password}
                                        </ErrorBox>
                                    ) : null}
                                    <ButtonContainer>
                                        <Input
                                            isDarkTheme={isDarkTheme}
                                            id="newEmail"
                                            autoComplete="new-password"
                                            placeholder="새로운 로그인 이메일을 입력해주세요."
                                            {...loginEmailFormik.getFieldProps(
                                                "newEmail",
                                            )}
                                        />
                                        <InputButton
                                            isDarkTheme={isDarkTheme}
                                            type="submit"
                                        >
                                            확인
                                        </InputButton>
                                    </ButtonContainer>
                                    {loginEmailFormik.touched.newEmail &&
                                    loginEmailFormik.errors.newEmail ? (
                                        <ErrorBox>
                                            {loginEmailFormik.errors.newEmail}
                                        </ErrorBox>
                                    ) : null}
                                </InputWrapper>
                            </InputForm>
                        </InputContainer>
                    )}
                </ButtonWrapper>
                <ButtonWrapper>
                    <ControlButton
                        isDarkTheme={isDarkTheme}
                        name="passwordButton"
                        onClick={e => {
                            handleButtonClick(e);
                            handlePasswordResetMode(e);
                        }}
                        selected={selectedButton}
                    >
                        비밀번호 설정
                    </ControlButton>
                    {isResetPasswordEditMode && (
                        <InputContainer>
                            <InputForm
                                onSubmit={passwordResetFormik.handleSubmit}
                            >
                                <InputWrapper>
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        placeholder="현재 비밀번호"
                                        type="password"
                                        {...passwordResetFormik.getFieldProps(
                                            "currentPassword",
                                        )}
                                    />
                                    {passwordResetFormik.touched
                                        .currentPassword &&
                                    passwordResetFormik.errors
                                        .currentPassword ? (
                                        <ErrorBox>
                                            {
                                                passwordResetFormik.errors
                                                    .currentPassword
                                            }
                                        </ErrorBox>
                                    ) : null}
                                    <Input
                                        isDarkTheme={isDarkTheme}
                                        placeholder="새로운 비빌번호"
                                        type="password"
                                        {...passwordResetFormik.getFieldProps(
                                            "newPassword",
                                        )}
                                    />
                                    {passwordResetFormik.touched.newPassword &&
                                    passwordResetFormik.errors.newPassword ? (
                                        <ErrorBox>
                                            {
                                                passwordResetFormik.errors
                                                    .newPassword
                                            }
                                        </ErrorBox>
                                    ) : null}
                                    <LastButtonContainer>
                                        <Input
                                            isDarkTheme={isDarkTheme}
                                            type="password"
                                            placeholder="새로운 비밀번호 확인"
                                            {...passwordResetFormik.getFieldProps(
                                                "newPasswordConfirm",
                                            )}
                                        />

                                        <InputButton
                                            isDarkTheme={isDarkTheme}
                                            type="submit"
                                        >
                                            설정
                                        </InputButton>
                                    </LastButtonContainer>
                                    {passwordResetFormik.touched
                                        .newPasswordConfirm &&
                                    passwordResetFormik.errors
                                        .newPasswordConfirm ? (
                                        <ErrorBox>
                                            {
                                                passwordResetFormik.errors
                                                    .newPasswordConfirm
                                            }
                                        </ErrorBox>
                                    ) : null}
                                </InputWrapper>
                            </InputForm>
                        </InputContainer>
                    )}
                </ButtonWrapper>
            </ControlContainer>
            <TitleWrapper isDarkTheme={isDarkTheme}>
                <Title isDarkTheme={isDarkTheme}>기타</Title>
            </TitleWrapper>
            <ControlButton
                isDarkTheme={isDarkTheme}
                name="dropAccount"
                onClick={handleDeleteAccount}
            >
                탈퇴하기
            </ControlButton>
        </>
    );
};

// 계정관리 타이틀 감싸는 div
const TitleWrapper = styled.div`
    padding-bottom: 10px;
    margin-bottom: 10px;
    ${props =>
        mixin.outline(
            "1.5px solid",
            props.isDarkTheme ? "darkLine" : "gray4",
            "bottom",
        )};
`;
// 계정관리 타이틀
const Title = styled.span`
    display: block;
    ${props =>
        mixin.textProps(
            30,
            "extraBold",
            props.isDarkTheme ? "white" : "black",
        )};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                22,
                "extraBold",
                props.isDarkTheme ? "white" : "black",
            )};
    }
`;
// 학교 인증 닉네임 설정 등, 계정관리 버튼 감싸는 div
const ControlContainer = styled.div`
    margin-bottom: 52px;
    ${mixin.flexBox("space-between", null, "column", "40%")};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        margin-bottom: ${({ theme }) => theme.calRem(40)};
    }
`;
// 버튼 감싸는 div
const ButtonWrapper = styled.div``;
// 학교인증, 닉네임 설정 등 계정 관리 버튼
const ControlButton = styled.button`
    height: 35px;
    padding: 0 20px;
    margin-bottom: 15px;
    width: fit-content;
    border-radius: 20px;
    background-color: transparent;
    ${props => (props.isDarkTheme ? null : mixin.boxShadow())};
    ${props =>
        mixin.outline(
            "2px solid",
            props.selected === props.name ? "mainMint" : "blue2",
        )};
    ${props => {
        if (props.isDarkTheme) {
            return mixin.textProps(
                18,
                "semiBold",
                props.selected === props.name ? "white" : "gray2",
            );
        } else {
            return mixin.textProps(
                18,
                "semiBold",
                props.selected === props.name ? "black" : "gray3",
            );
        }
    }};

    @media ${({ theme }) => theme.mobile} {
        margin-bottom: 10px;
        height: ${({ theme }) => theme.calRem(24)};
        ${props => {
            if (props.isDarkTheme) {
                return mixin.textProps(
                    11,
                    "semiBold",
                    props.selected === props.name ? "white" : "gray2",
                );
            } else {
                return mixin.textProps(
                    11,
                    "semiBold",
                    props.selected === props.name ? "black" : "gray3",
                );
            }
        }};
    }
`;
// 인풋창 컨테이너
const InputContainer = styled.div`
    width: 100%;
    ${mixin.flexBox(null, null, "column")};
`;
// 이메일 인증부분 인풋 form
const FirstInputForm = styled.form`
    width: 100%;
    ${mixin.flexBox(null, "flex-end")};
`;
// 이메일 인증부분 제외 다른 계정관리 인풋 폼
const InputForm = styled.form`
    width: 100%;
    margin-bottom: 21px;
    ${mixin.flexBox(null, "flex-end")};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        margin-bottom: 0px;
    } ;
`;
// 인풋 입력 창
const Input = styled.input`
    height: 25px;
    width: 90%;
    border: none;
    border-radius: 0px;
    background: transparent;
    ${props =>
        mixin.outline(
            "1px solid",
            props.isDarkTheme ? "gray1" : "gray2",
            "bottom",
        )};
    :focus {
        ${props =>
            mixin.outline(
                "1px solid",
                props.isDarkTheme ? "gray1" : "mainBlue",
                "bottom",
            )};
    }
    transition: border-color 1s ease;
    ${props =>
        mixin.textProps(
            18,
            "semiBold",
            props.isDarkTheme ? "mainGray" : "gray1",
        )};
    ::placeholder {
        ${props =>
            mixin.textProps(
                18,
                "semiBold",
                props.isDarkTheme ? "gray2" : "gray3",
            )};
    }

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        width: 100%;
        ${props =>
            mixin.textProps(
                14,
                "semiBold",
                props.isDarkTheme ? "mainGray" : "gray1",
            )};
        ::placeholder {
            ${props =>
                mixin.textProps(
                    14,
                    "semiBold",
                    props.isDarkTheme ? "gray2" : "gray3",
                )};
        }
    }
`;
// 인풋 입력후 확인 / 설정 등 submit 버튼
const InputButton = styled.button`
    width: 80px;
    height: 32px;
    border-radius: 40px;
    margin-left: 10px;
    ${props =>
        mixin.textProps(18, "semiBold", props.isDarkTheme ? "black" : "white")};
    background-color: ${props => props.theme.color.blue1};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                11,
                "semiBold",
                props.isDarkTheme ? "black" : "white",
            )};
        width: ${({ theme }) => theme.calRem(56)};
        height: ${({ theme }) => theme.calRem(24)};
    }
`;
// 이메일 인증부분 submit 버튼
const FirstInputButton = styled.button`
    width: 80px;
    height: 32px;
    border-radius: 40px;
    margin-left: 10px;
    ${props =>
        mixin.textProps(18, "semiBold", props.isDarkTheme ? "black" : "white")};
    background-color: ${props => props.theme.color.blue1};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        ${props =>
            mixin.textProps(
                11,
                "semiBold",
                props.isDarkTheme ? "black" : "white",
            )};
        width: ${({ theme }) => theme.calRem(56)};
        height: ${({ theme }) => theme.calRem(24)};
    }
`;
// 이메일 인증부분 인풋 컨테이너
const FirstInputWrapper = styled.div`
    width: 100%;
    ${mixin.flexBox(null, null, "column")};
`;
const InputWrapper = styled.div`
    width: 100%;
    margin-bottom: 20px;
    ${mixin.flexBox(null, null, "column")};
    Input {
        :nth-child(2) {
            margin: 17px 0;
        }
    }
`;

const ButtonContainer = styled.div`
    Input {
        margin-top: 17px;
    }
    ${mixin.flexBox(null, "flex-end")};
`;

const FirstButtonContainer = styled.div`
    ${mixin.flexBox(null, "flex-end")};
`;

const LastButtonContainer = styled.div`
    @media ${({ theme }) => theme.mobile} {
        display: flex;
    }
`;
// 에러 메세지 div
const ErrorBox = styled.div`
    margin-top: 4px;
    ${mixin.textProps(12, "semiBold", "danger")};

    //모바일 사이즈
    @media ${({ theme }) => theme.mobile} {
        ${mixin.textProps(11, "semiBold", "danger")};
    }
`;
export default MypageAccount;
