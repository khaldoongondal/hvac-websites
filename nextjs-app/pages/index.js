export default function Home() {
  return null
}

export async function getServerSideProps() {
  return { notFound: true }
}
