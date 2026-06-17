'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Entity {
    rut: string;
    type: "person" | "company";
    firstName?: string;
    lastNameFather?: string;
    lastNameMother?: string;
    businessName?: string;
    address: string;
    communeId: number;
    email: string;
    phone: string;
}

interface FormErrors {
    rut?: string;
    firstName?: string;
    lastNameFather?: string;
    lastNameMother?: string;
    businessName?: string;
    address?: string;
    commune?: string;
    email?: string;
    phone?: string;
}

export default function UserForm() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [showModal, setShowModal] = useState(false);
    const [savedData, setSavedData] = useState<any>(null);
    const [activeRole, setActiveRole] = useState<string | null>(null);

    const [errors, setErrors] = useState<FormErrors>({});
    const [communes, setCommunes] = useState<{ id: number; name: string }[]>([]);

    const [data, setData] = useState<any[]>([]);

    const [formData, setFormData] = useState<Entity>({
        rut: "",
        type: "person",
        firstName: "",
        lastNameFather: "",
        lastNameMother: "",
        businessName: "",
        address: "",
        communeId: 0,
        email: "",
        phone: "",
    });

    const isClient = formData.type === "person";
    const isCompany = formData.type === "company";

    const fetchPersons = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/entity`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCommunes = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/commune`
            );

            if (!res.ok) {
                throw new Error(
                    "Failed to fetch communes"
                );
            }

            const json = await res.json();
            setCommunes(json.data);

        } catch (error) {
            console.error(error);
        }
    };

    const fetchPersonByRut = async (rut: string) => {

        if (!rut) return;

        try {

            const url =
                `${process.env.NEXT_PUBLIC_API_URL}/entity/${rut}`;

            const res = await fetch(url);

            if (!res.ok) {
                return;
            }

            const json = await res.json();

            const person = json.data;

            if (!person) {
                return;

            }

            setFormData({
                rut: person.rut ?? "",
                type: person.type ?? "",
                firstName: person.first_name ?? "",
                lastNameFather: person.last_name_father ?? "",
                lastNameMother: person.last_name_mother ?? "",
                businessName: person.business_name ?? "",
                address: person.address ?? "",
                communeId: person.commune_id ?? 0,
                email: person.email ?? "",
                phone: person.phone ?? "",
            });

        } catch (err) {
            console.error(
                "Failed to fetch person:",
                err
            );
        }
    };

    useEffect(() => {
        fetchPersons();
        fetchCommunes();

        const rut = searchParams.get("rut");

        if (rut) {
            fetchPersonByRut(rut);
        }

    }, [searchParams]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "communeId" ? Number(value) : value,
        });

        setErrors({
            ...errors,
            [e.target.name]: "",
        });

    };

    const validateForm = () => {
    const newErrors: FormErrors = {};

    const rutRegex = /^\d{7,8}-[\dkK]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;

    if (!formData.rut || !rutRegex.test(formData.rut)) {
        newErrors.rut = "RUT inválido";
    }

    // person
    if (formData.type === "person") {
        if (!formData.firstName) newErrors.firstName = "Nombre requerido";
        if (!formData.lastNameFather) newErrors.lastNameFather = "Apellido requerido";
        if (!formData.lastNameMother) newErrors.lastNameMother = "Apellido requerido";
    }

    //company
    if (formData.type === "company") {
        if (!formData.businessName) {
            newErrors.businessName = "Razón social requerida";
        }
    }

    if (!formData.address) newErrors.address = "Dirección requerida";

    if (!formData.communeId) newErrors.commune = "Comuna requerida";

    if (!formData.email || !emailRegex.test(formData.email)) {
        newErrors.email = "Email inválido";
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
        newErrors.phone = "Teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/entity`;
            const res =
                await fetch(
                    url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(formData),
                    }

                );

            if (!res.ok) {

                const errorText =
                    await res.text();

                console.error(
                    "API ERROR:",
                    errorText
                );

                return;

            }
            const response = await res.json();

            const person = Array.isArray(response.data)
                ? response.data[0]
                : response.data;

            if (!person) {
                console.error("No person returned");
                return;
            }
            setSavedData({
                rut: person.rut,
                firstName: person.first_name,
                lastNameFather: person.last_name_father,
                lastNameMother: person.last_name_mother,
                address: person.address,
                commune: person.commune,
                email: person.email,
                phone: person.phone,
            });

            await fetchPersons();

            setShowModal(true);

        } catch (err) {

            console.error(
                "REQUEST FAILED:",
                err
            );

        }

    };

    return (
        <>
            <div className="flex gap-6 items-start">
                <div className="w-1/3">
                    <div className="rounded-lg border p-4 bg-white shadow-md space-y-3">

                        <h3 className="font-semibold text-gray-700 text-center">
                            Acciones
                        </h3>

                        <button
                            className="w-full px-2 py-2 text-sm bg-green-600 text-white rounded"
                            onClick={async () => {
                                setActiveRole("Proveedores");
                                setFormData((prev) => ({
                                    ...prev,
                                    type: "company",
                                }));
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/provider`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ entity_id: formData.rut }),
                                });
                            }}
                        >
                            Proveedores
                        </button>

                        <button
                            className="w-full px-2 py-2 text-sm bg-blue-600 text-white rounded"
                            onClick={async () => {
                                setActiveRole("Clientes");
                                setFormData((prev) => ({
                                    ...prev,
                                    type: "person",
                                }));
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ entity_id: formData.rut }),
                                });
                            }}
                        >
                            Clientes
                        </button>

                        <button
                            className="w-full px-2 py-2 text-sm bg-purple-600 text-white rounded"
                            onClick={async () => {
                                setActiveRole("Asesores");
                                setFormData((prev) => ({
                                    ...prev,
                                    type: "company",
                                }));
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advisor`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ entity_id: formData.rut }),
                                });
                            }}
                        >
                            Asesores
                        </button>

                    </div>
                </div>

                <div className="w-2/3">
                    {activeRole && (
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            Formulario {activeRole}
                        </h2>
                    )}

                    {isClient ? (
                        <form
                            onSubmit={handleSubmit}
                            className="pb-10 space-y-6"
                        >
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Rut
                                        </label>

                                        <input
                                            type="text"
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleChange}
                                            onBlur={() => fetchPersonByRut(formData.rut)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                        />

                                        {errors.rut && (
                                            <p className="mt-1 text-sm text-red-600">{errors.rut}</p>
                                        )}
                                    </div>

                                    {[
                                        ["Nombre", "firstName", errors.firstName],
                                        ["Apellido Paterno", "lastNameFather", errors.lastNameFather],
                                        ["Apellido Materno", "lastNameMother", errors.lastNameMother],
                                        ["Direccion", "address", errors.address],
                                        ["Correo Electronico", "email", errors.email],
                                        ["Telefono", "phone", errors.phone],
                                    ].map(([label, name, error]) => (
                                        <div key={name}>
                                            <label className="block text-sm font-medium text-gray-700">
                                                {label}
                                            </label>

                                            <input
                                                type={name === "email" ? "email" : "text"}
                                                name={name}
                                                value={formData[name as keyof typeof formData]}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                            />

                                            {error && (
                                                <p className="mt-1 text-sm text-red-600">{error}</p>
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Comuna
                                        </label>

                                        <select
                                            name="communeId"
                                            value={formData.communeId}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                        >
                                            <option value="">Selecciona la comuna</option>

                                            {communes.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.commune && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.commune}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            onClick={() => (window.location.reload())}
                                            className="w-full rounded-md bg-gray-500 py-2 text-white"
                                        >
                                            Limpiar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!formData.rut) return;

                                                await fetch(
                                                    `${process.env.NEXT_PUBLIC_API_URL}/entity/${formData.rut}`,
                                                    { method: "DELETE" }
                                                );
                                                setFormData({
                                                    rut: "",
                                                    type: "person",
                                                    firstName: "",
                                                    lastNameFather: "",
                                                    lastNameMother: "",
                                                    address: "",
                                                    communeId: 0,
                                                    email: "",
                                                    phone: "",
                                                });
                                                await fetchPersons();
                                                setShowModal(false);
                                                router.replace("/form");
                                            }}
                                            className="w-full rounded-md bg-red-600 py-2 text-white"
                                        >
                                            Eliminar
                                        </button>

                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-blue-700 py-2 text-white"
                                        >
                                            Registrar
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (

                        <form
                            onSubmit={handleSubmit}
                            className="pb-10 space-y-6"
                        >
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Rut
                                        </label>

                                        <input
                                            type="text"
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleChange}
                                            onBlur={() => fetchPersonByRut(formData.rut)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                        />

                                        {errors.rut && (
                                            <p className="mt-1 text-sm text-red-600">{errors.rut}</p>
                                        )}
                                    </div>

                                    {[
                                        ["Razon Social", "businessName", errors.businessName],
                                        ["Direccion", "address", errors.address],
                                        ["Correo Electronico", "email", errors.email],
                                        ["Telefono", "phone", errors.phone],
                                    ].map(([label, name, error]) => (
                                        <div key={name}>
                                            <label className="block text-sm font-medium text-gray-700">
                                                {label}
                                            </label>

                                            <input
                                                type={name === "email" ? "email" : "text"}
                                                name={name}
                                                value={formData[name as keyof typeof formData]}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                            />

                                            {error && (
                                                <p className="mt-1 text-sm text-red-600">{error}</p>
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Comuna
                                        </label>

                                        <select
                                            name="communeId"
                                            value={formData.communeId}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                        >
                                            <option value="">Selecciona la comuna</option>

                                            {communes.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.commune && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.commune}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            onClick={() => (window.location.reload())}
                                            className="w-full rounded-md bg-gray-500 py-2 text-white"
                                        >
                                            Limpiar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!formData.rut) return;

                                                await fetch(
                                                    `${process.env.NEXT_PUBLIC_API_URL}/entity/${formData.rut}`,
                                                    { method: "DELETE" }
                                                );
                                                setFormData({
                                                    rut: "",
                                                    type: "person",
                                                    firstName: "",
                                                    lastNameFather: "",
                                                    lastNameMother: "",
                                                    address: "",
                                                    communeId: 0,
                                                    email: "",
                                                    phone: "",
                                                });
                                                await fetchPersons();
                                                setShowModal(false);
                                                router.replace("/form");
                                            }}
                                            className="w-full rounded-md bg-red-600 py-2 text-white"
                                        >
                                            Eliminar
                                        </button>

                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-blue-700 py-2 text-white"
                                        >
                                            Registrar
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </form>
                    )
                    }
                </div>
            </div>
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex justify-center items-center"
                >
                    <div className="bg-white p-6 rounded-lg w-[700px] max-h-[80vh] overflow-auto">

                        <h2 className="text-xl font-bold mb-4">
                            Lista de Usuarios
                        </h2>

                        <table className="w-full border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">RUT</th>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Email</th>
                                    <th className="border p-2">Phone</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((entity) => (
                                    <tr key={entity.rut} className="hover:bg-gray-50">

                                        <td
                                            className="border p-2 text-blue-600 cursor-pointer"
                                            onClick={async () => {
                                                await fetchPersonByRut(entity.rut)
                                                setShowModal(false);
                                            }}
                                        >
                                            {entity.rut}
                                        </td>

                                        <td className="border p-2 text-blue-600 cursor-pointer">
                                            {entity.type === "company" ? entity.business_name : `${entity.first_name} ${entity.last_name_father}`}
                                        </td>

                                        <td className="border p-2">
                                            {entity.email}
                                        </td>

                                        <td className="border p-2">
                                            {entity.phone}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}