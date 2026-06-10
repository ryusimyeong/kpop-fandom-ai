/**
 * @file 클라이언트에서 사용하는 GraphQL 쿼리/뮤테이션 문서.
 *
 * [학습 메모] GraphQL을 처음 적용하며 의식적으로 연습한 것들:
 * - 오퍼레이션 문서를 컴포넌트에서 분리해 한곳에서 관리(REST의 endpoint 상수 모음과 같은 역할).
 * - `$변수`로 쿼리를 파라미터화 → 같은 쿼리를 검색어/카테고리만 바꿔 재사용.
 * - 응답에서 **필요한 필드만 명시적으로 선택**(over-fetching 방지) — REST에서 겪던 "불필요한 필드까지
 *   내려오는" 문제를 클라이언트가 직접 통제한다는 점이 GraphQL의 핵심 차이라고 이해했다.
 */
import { gql } from '@apollo/client';

export const GET_ARTISTS = gql`
  query GetArtists($search: String) {
    artists(search: $search) {
      id
      name
      debutYear
      agency
      bio
      albums {
        id
        title
        releaseYear
        trackCount
      }
    }
  }
`;

export const GET_TERMS = gql`
  query GetTerms($category: TermCategory, $search: String) {
    terms(category: $category, search: $search) {
      id
      term
      romanized
      category
      meaning
      example
    }
  }
`;

export const ASK = gql`
  mutation Ask($question: String!) {
    ask(question: $question) {
      question
      answer
      sources
    }
  }
`;
