import { Link, useNavigate } from 'react-router-dom'

export default function Ephod() {
  return (
     <div className="w-[512px] h-[552px] relative bg-yellow-600 rounded-[10px]">
      <Link className="w-[140px] h-[110px] left-[23px] top-[23px] absolute bg-yellow-400 rounded-[5px] text-black flex items-center justify-center" to='./Zebulon'>Zebulon</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[23px] absolute bg-orange-400 rounded-[5px] text-black flex items-center justify-center" to='./Issachar'>Issachar</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[23px] absolute bg-red-600 rounded-[5px] text-black flex items-center justify-center" to='./Judah'>Judah</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[155px] absolute bg-amber-500 rounded-[5px] text-black flex items-center justify-center" to='./Gad'>Gad</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[155px] absolute bg-teal-300 rounded-[5px] text-black flex items-center justify-center" to='./Naphtali'>Naphtali</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[155px] absolute bg-orange-900 rounded-[5px] text-black flex items-center justify-center" to='./Dan'>Dan</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[287px] absolute bg-gray-500 rounded-[5px] text-black flex items-center justify-center" to='./Levi'>Levi</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[287px] absolute bg-indigo-800 rounded-[5px] text-black flex items-center justify-center" to='./Simeon'>Simeon</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[287px] absolute bg-indigo-800 rounded-[5px] text-black flex items-center justify-center" to='./Reuben'>Reuben</Link>
      <Link className="w-[140px] h-[110px] left-[23px] top-[419px] absolute bg-red-500 rounded-[5px] text-black flex items-center justify-center" to='./Benjamin'>Benjamin</Link>
      <Link className="w-[140px] h-[110px] left-[186px] top-[419px] absolute bg-stone-100 rounded-[5px] text-black flex items-center justify-center" to='./Joseph'>Joseph</Link>
      <Link className="w-[140px] h-[110px] left-[349px] top-[419px] absolute bg-yellow-300 rounded-[5px] text-black flex items-center justify-center" to='./Asher'>Asher</Link>
    </div>
  )
}