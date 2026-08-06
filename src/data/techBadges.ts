export interface TechBadge {
  color: string;
  monogram: string;
}

export const techBadges: Record<string, TechBadge> = {
  Go: { color: '#00add8', monogram: 'Go' },
  TypeScript: { color: '#3178c6', monogram: 'TS' },
  JavaScript: { color: '#c9a227', monogram: 'JS' },
  Python: { color: '#3776ab', monogram: 'Py' },
  PHP: { color: '#777bb4', monogram: 'Ph' },
  'Node.js': { color: '#5fa04e', monogram: 'N' },
  Kotlin: { color: '#7f52ff', monogram: 'Kt' },
  Java: { color: '#e76f00', monogram: 'Ja' },
  JEE: { color: '#e76f00', monogram: 'EE' },
  Gradle: { color: '#02303a', monogram: 'Gr' },
  Spring: { color: '#5a9e30', monogram: 'Sp' },
  'Spring Boot': { color: '#5a9e30', monogram: 'SB' },
  Laravel: { color: '#ff2d20', monogram: 'Lv' },
  JUnit: { color: '#25a162', monogram: 'JU' },
  'Next.js': { color: '#2a2a2a', monogram: 'Nx' },
  React: { color: '#149eca', monogram: 'Re' },
  Angular: { color: '#c3002f', monogram: 'Ng' },
  Vite: { color: '#646cff', monogram: 'Vi' },
  Jest: { color: '#c21325', monogram: 'Je' },
  PostgreSQL: { color: '#336791', monogram: 'PG' },
  Postgres: { color: '#336791', monogram: 'PG' },
  MySQL: { color: '#00758f', monogram: 'My' },
  Stripe: { color: '#635bff', monogram: 'St' },
  Klaviyo: { color: '#232426', monogram: 'Kl' },
  Bash: { color: '#4eaa25', monogram: 'Sh' },
  Redis: { color: '#d82c20', monogram: 'R' },
  Kafka: { color: '#2a2a2a', monogram: 'K' },
  Docker: { color: '#2496ed', monogram: 'D' },
  Kubernetes: { color: '#326ce5', monogram: 'K8' },
  Proxmox: { color: '#e57000', monogram: 'Px' },
  Traefik: { color: '#24a1c1', monogram: 'Tk' },
  gRPC: { color: '#2da3a1', monogram: 'gR' },
  Fastify: { color: '#2a2a2a', monogram: 'Fy' },
  OAuth2: { color: '#ee7b1f', monogram: 'O2' },
  JWT: { color: '#d6336c', monogram: 'JW' },
  Airflow: { color: '#017cee', monogram: 'Af' },
  BigQuery: { color: '#669df6', monogram: 'BQ' },
  Grafana: { color: '#f46800', monogram: 'Gf' },
  OpenAPI: { color: '#6ba539', monogram: 'OA' },
  GCP: { color: '#3b7ddd', monogram: 'GC' },
  Git: { color: '#e8542f', monogram: 'Gt' },
  Linux: { color: '#33373d', monogram: 'Lx' },
  Terraform: { color: '#7b42bc', monogram: 'Tf' },
  'CI/CD': { color: '#2088ff', monogram: 'CI' },
};

export function getBadge(tech: string): TechBadge {
  return techBadges[tech] ?? { color: '#7a8394', monogram: tech.slice(0, 2) };
}
