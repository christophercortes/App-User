'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
  rut: string;
  first_name: string;
  last_name_father: string;
  last_name_mother: string;
  address: string;
  commune: string;
  email: string;
  phone: string;
}

export default function PersonPage() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/person`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const json = await res.json();

      setData(json.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Persons
      </h1>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">RUT</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
          </tr>
        </thead>

        <tbody>
          {data.map((person) => (
            <tr key={person.rut}>

              <td className="border p-2">
                <Link
                  href={`/form?rut=${person.rut}`}
                  className="text-blue-600 hover:underline"
                >
                  {person.rut}
                </Link>
              </td>

              <td className="border p-2">
                <Link
                  href={`/form?rut=${person.rut}`}
                  className="text-blue-600 hover:underline"
                >
                  {person.first_name}
                </Link>
              </td>

              <td className="border p-2">
                {person.last_name_father} {person.last_name_mother}
              </td>

              <td className="border p-2">
                {person.email}
              </td>

              <td className="border p-2">
                {person.phone}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}