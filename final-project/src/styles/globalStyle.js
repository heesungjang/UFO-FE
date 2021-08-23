import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

/* 다이나믹 서브셋 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css');

/* font 설정 */
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family: 'Pretendard', sans-serif;

  &:focus,&:hover,&:active{
  outline:none 
  }
}
ul {
  list-style: none;
}
a {
  text-decoration: none;
}
button {
  border: 0;
  cursor: pointer;
}
body{
  /* 스크롤바 제거 */
  /* &::-webkit-scrollbar {
    display: none;
  } */
  /* background-color: #EEF1F5; */
}

/* CKEditor css설정 */
.ck-content{
    *{
        font-size: ${({ theme }) => theme.fontSize["20"]};
        color:${({ theme }) => theme.color.gray1};
    }
    h1{
        font-size: ${({ theme }) => theme.fontSize["40"]};
    }
    h2{
        font-size: ${({ theme }) => theme.fontSize["30"]};
    }
    a{
        color:${({ theme }) => theme.color.mainBlue};
    } 
}
`;
