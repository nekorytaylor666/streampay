export default function Vesting() {
    return <div className="relative text-gray-400 -mx-2 p-2 rounded-md">
        <div className={`absolute text-primary bg-gray-900 opacity-50 top-0 bottom-0 left-0 right-0 z-10 block`}>
            {/*<h1 className="primary secondary text-xl text-right">COMING SOON™</h1>*/}
        </div>
        <label className="block mb-2 font-medium text-gray-100 capitalize">Vesting Schedule - COMING SOON™</label>
        First <input type="number"
                     className="text-white p-0.5 bg-gray-800 border-primary w-8 inline border-black rounded-md focus:ring-secondary focus:border-secondary"
    /> % released at <input type="date"
                            className="text-white p-0.5 bg-gray-800 border-primary inline border-black rounded-md focus:ring-secondary focus:border-secondary"/><br/>
        and then <input type="number"
                        className="text-white py-0.5 px-1 bg-gray-800 border-primary inline w-5 border-black rounded-md focus:ring-secondary focus:border-secondary"
    /> % released each <input type="number" defaultValue={2}
                              className="text-white py-0.5 px-1 w-5 mt-4 bg-gray-800 border-primary inline border-black rounded-md focus:ring-secondary focus:border-secondary"/>
        &nbsp;<select
        className="mt-1 text-white p-0.5 pr-7 bg-gray-800 border-primary w-26 rounded-md focus:ring-secondary focus:border-secondary"
        defaultValue="SOL">
        <option value="month">months</option>
    </select>

    </div>;
}