import Nav from '../components/Nav'
import Ephod from '../components/Ephod'


export default function Tribes({ user }) {
  return (
    <>
      <Nav user={user} />
      <h1>Tribes</h1>
      <Ephod />
    </>
  )
}