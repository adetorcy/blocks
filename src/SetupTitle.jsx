// Title of every 2P setup screen, for the side we're on
// side: create (CREATE 2P GAME) or join (opened a link)
const TITLES = {
  create: "CREATE 2P GAME",
  join: "JOIN 2P GAME",
};

export default function SetupTitle({ side }) {
  return <div className={`setup-title ${side}`}>{TITLES[side]}</div>;
}
