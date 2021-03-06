import React, { useState } from "react";
import styled from "styled-components";
import mixin from "../../Styles/Mixin";

//컴포넌트
import CandidateCard from "./CandidateCard";
import CandidateIntroBox from "./CandidateIntroBox";

const CandidateBox = ({ candidateList, isDarkTheme, isTest }) => {
    const [candidateIdx, setCandidateIdx] = useState(0); //상세페이지에서 보여줄 후보자의 id값
    const getCandidateIdx = idx => {
        setCandidateIdx(idx);
    };

    return (
        <CandidateBoxContainer>
            <CandidateCardBox>
                {candidateList &&
                    candidateList.map((candidate, idx) => (
                        <CandidateCard
                            isDarkTheme={isDarkTheme}
                            candidate={candidate}
                            key={idx}
                            idx={idx}
                            cursor
                            isContact
                            getCandidateIdx={getCandidateIdx}
                            isTest={isTest ? true : false}
                        />
                    ))}
            </CandidateCardBox>
            <CandidateIntroBox
                isDarkTheme={isDarkTheme}
                candidates={candidateList}
                idx={candidateIdx}
                isTest={isTest ? true : false}
            />
        </CandidateBoxContainer>
    );
};

const CandidateBoxContainer = styled.div``;
const CandidateCardBox = styled.div`
    ${mixin.flexBox("space-evenly")}
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.calRem(16)};
`;

export default CandidateBox;
