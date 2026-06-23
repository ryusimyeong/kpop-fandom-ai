/**
 * @file 아티스트 썸네일 — next/image 최적화 패턴 시연용 컴포넌트.
 *
 * 왜 이 컴포넌트가 존재하나(why):
 * - 현재 토이에는 실제 이미지 자산이 없지만, 공고 필수 "성능 최적화/Web Vitals"를 증명하려면
 *   이미지 최적화 패턴(next/image)을 실물 코드로 보여주는 게 핵심이다.
 * - 그래서 외부 자산 없이도 동작하도록 *인라인 SVG data URI* 플레이스홀더를 기본 src로 둔다.
 *   (네트워크 의존 0 → CI/데모가 절대 깨지지 않음)
 *
 * next/image로 얻는 성능 이점(why next/image):
 * 1) CLS 방지: width/height를 필수로 받아 브라우저가 로드 전에 가로세로 비율을 확보 → 레이아웃 점프 0.
 * 2) LCP 개선: priority=true면 <link rel="preload">를 주입해 above-the-fold 핵심 이미지를 선반입.
 *    반대로 화면 밖 이미지는 기본 loading="lazy"로 미뤄 초기 전송량을 줄인다.
 * 3) 자동 포맷/리사이즈: 빌드/런타임에 WebP/AVIF 및 디바이스별 srcset 생성(원격 자산일 때).
 *
 * 주의(보수적): 실제 원격 도메인 이미지를 쓰려면 next.config의 images.remotePatterns 등록이 필요하다.
 *               (이 토이는 data URI라 설정 불필요 — 통합 단계 반환 노트에 별도 명시)
 */
import Image from 'next/image';

interface ArtistThumbnailProps {
  /** 표시할 이미지 URL. 미지정 시 인라인 SVG 플레이스홀더 사용(외부 의존 0) */
  src?: string;
  /** 대체 텍스트(접근성). 장식용이 아니면 반드시 의미 있는 값 전달 */
  alt: string;
  /** 렌더 박스 크기(px). next/image는 width/height로 종횡비를 미리 잡아 CLS를 막는다 */
  size?: number;
  /**
   * above-the-fold(첫 화면)에 보이는 핵심(LCP 후보) 이미지인지.
   * - true: preload하여 LCP 가속(페이지당 한두 개만!)
   * - false(기본): lazy 로딩으로 초기 전송량 절감
   */
  priority?: boolean;
}

/**
 * 외부 자산 없이도 표시되는 1x1 회색 SVG 플레이스홀더(data URI).
 * 실제 서비스라면 이 자리에 CDN/스토리지 URL이 들어간다.
 */
const PLACEHOLDER_SRC =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
      '<rect width="100%" height="100%" fill="#f3f4f6"/>' +
      '<text x="50%" y="50%" font-size="14" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">IMG</text>' +
      '</svg>',
  );

export function ArtistThumbnail({ src, alt, size = 96, priority = false }: ArtistThumbnailProps) {
  return (
    <Image
      src={src ?? PLACEHOLDER_SRC}
      alt={alt}
      width={size}
      height={size}
      // priority=false일 때만 lazy. priority=true면 next/image가 자동으로 eager+preload 처리.
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      // 종횡비 고정용 인라인 스타일(반응형 축소 허용하되 비율 유지 → CLS 방지)
      style={{ height: 'auto', maxWidth: '100%', borderRadius: '0.5rem' }}
    />
  );
}
