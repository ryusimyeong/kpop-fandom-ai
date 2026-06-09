/**
 * @file 클라이언트에서 사용하는 GraphQL 쿼리/뮤테이션 문서.
 * 변수·필터·페이지네이션 등 실제 GraphQL 사용 패턴을 보여주기 위해 분리.
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
