/**
 * @file Relay 스타일 cursor 기반 페이지네이션 유틸 (순수 함수 → DB 없이 단위 테스트 가능).
 *
 * [학습 메모] 왜 offset이 아니라 cursor인가
 * - offset/limit은 데이터가 중간에 삽입/삭제되면 페이지가 밀려(중복/누락) 보인다.
 * - cursor는 "마지막으로 본 항목의 안정적 키(id)" 이후를 가리키므로 그런 흔들림이 없다.
 * - cursor를 base64로 감싸 "불투명(opaque)"하게 노출 → 클라이언트가 내부 구현(id)에 의존하지 못하게 한다.
 */

/** id를 불투명 cursor 문자열로 인코딩. (형식이 노출되지 않도록 prefix 후 base64) */
export function encodeCursor(id: string): string {
  return Buffer.from(`cursor:${id}`, 'utf8').toString('base64');
}

/** cursor 문자열을 id로 디코딩. 형식이 잘못되면 null. */
export function decodeCursor(cursor: string): string | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    if (!decoded.startsWith('cursor:')) return null;
    const id = decoded.slice('cursor:'.length);
    return id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

/**
 * id를 가진 정렬된 행 배열을 Relay Connection으로 변환.
 *
 * 핵심 트릭: 호출부에서 `first + 1`개를 조회한 뒤 이 함수에 `first`를 넘긴다.
 * 여분 1개가 있으면 다음 페이지가 존재(hasNextPage=true)한다고 판단하고, 그 1개는 잘라낸다.
 * 이 함수 자체는 넘어온 배열에서 first개만 취하고 길이를 비교한다.
 */
export function toConnection<T extends { id: string }>(rows: T[], first: number): Connection<T> {
  const hasNextPage = rows.length > first;
  const sliced = hasNextPage ? rows.slice(0, first) : rows;
  const edges = sliced.map((node) => ({ node, cursor: encodeCursor(node.id) }));
  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
  };
}
