import { Link } from "react-router-dom";
import './board.css'

export default function Board({id, title, background}: { id:number; title: string, background:string}) {
  return (
      <Link to={`my-react-trello/board/${id}`} className="board" style={{backgroundColor: background}}>
          <div className="title board__title">{title}</div>
      </Link>
    );
  }
  