import { Link, useNavigate } from 'react-router-dom'

export default function Ephod() {
  return (
     <div className="w-[512px] h-[552px] relative bg-yellow-600 rounded-[10px]">
      <Link className="w-[140px] h-[110px] left-[23px] top-[23px] absolute bg-yellow-400 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#61CC97"}} to='./Zebulon'>Zebulon</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[23px] absolute bg-orange-400 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#E0A354"}} to='./Issachar'>Issachar</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[23px] absolute bg-red-600 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#D92121"}} to='./Judah'>Judah</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[155px] absolute bg-amber-500 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#7F2819"}} to='./Gad'>Gad</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[155px] absolute bg-teal-300 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#c8ad7f"}} to='./Naphtali'>Naphtali</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[155px] absolute bg-orange-900 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#2C282C"}} to='./Dan'>Dan</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[287px] absolute bg-gray-500 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#6D4B8F"}} to='./Levi'>Levi</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[287px] absolute bg-indigo-800 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#4F8129"}} to='./Simeon'>Simeon</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[287px] absolute bg-indigo-800 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#303698"}} to='./Reuben'>Reuben</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[419px] absolute bg-red-500 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#e64441"}} to='./Benjamin'>Benjamin</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[419px] absolute bg-stone-100 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#F6F6F2"}} to='./Joseph'>Joseph</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[419px] absolute bg-yellow-300 rounded-[5px] text-black flex items-center justify-center" style={{backgroundColor: "#8e9849"}} to='./Asher'>Asher</Link>
    </div>
  )
}