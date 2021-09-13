export default function Vesting({visible}: { visible: boolean }) {
    return <div hidden={!visible} className="relative text-gray-400 -mx-2 p-2 rounded-md">
        <div className={`absolute text-primary bg-gray-900 opacity-60 top-0 bottom-0 left-0 right-0 z-10 block`}>
        </div>
        <label className="block mb-2 font-medium text-gray-100 capitalize">COMING SOON™</label>
        First <input type="number" defaultValue={25}
                     className="text-white p-0.5 bg-gray-800 border-primary w-8 inline border-black rounded-md focus:ring-secondary focus:border-secondary"
    /> % released at <input type="date"
                            className="text-white p-0.5 bg-gray-800 border-primary inline border-black rounded-md focus:ring-secondary focus:border-secondary"/><br/>
        and then <input type="number" defaultValue={5}
                        className="text-white py-0.5 px-1 bg-gray-800 border-primary inline w-5 border-black rounded-md focus:ring-secondary focus:border-secondary"
    /> % released each <input type="number" defaultValue={2}
                              className="text-white py-0.5 px-1 w-5 mt-4 bg-gray-800 border-primary inline border-black rounded-md focus:ring-secondary focus:border-secondary"/>
        &nbsp;<select
        className="mt-1 text-white p-0.5 pr-7 bg-gray-800 border-primary w-26 rounded-md focus:ring-secondary focus:border-secondary"
        defaultValue="SOL">
        <option value="month">months</option>
    </select>
        <br/>
        <input type="checkbox" readOnly={true} checked={true} className="text-primary w-6 h-6 rounded-sm"/> <span
        className="inline-block mt-4">Transferable</span>
    </div>;
}