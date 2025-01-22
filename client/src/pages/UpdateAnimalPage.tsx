import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import Loading from "../components/Loading";
import Select from "react-select";
import { colorOptions, genderOptions, healthStatusOptions } from "../constants/data";
import ImageUploadModal from "../components/ImageUploadModal";
import LocationModal from "../components/LocationModal";
import { useState } from "react";

const fetchAnimal = async (id: string) => {
  const res = await axios.get(`http://localhost:3000/animals/${id}`);
  return res.data;
};

const UpdateAnimalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: animal, isPending, error } = useQuery({
    queryKey: ["animal", id],
    queryFn: () => fetchAnimal(id!),
  });

  const queryClient = useQueryClient();

  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: animal?.location?.latitude || null,
    longitude: animal?.location?.longitude || null,
  });

  const [image, setImage] = useState<string | null>(animal?.image || "");
  const [tempImage, setTempImage] = useState<string | null>(animal?.image || "");
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (updatedAnimal: any) => {
      return axios.put(`http://localhost:3000/animals/${id}`, updatedAnimal, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animal", id] });
      toast.success("Hayvan başarıyla güncellendi.");
      navigate("/");
    },
    onError: () => {
      toast.error("Hayvan güncellenirken bir hata oluştu.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (location.latitude && location.longitude) {
      formData.append("location", JSON.stringify(location));
    }

    if (image) {
      formData.append("image", image);
    }

    mutation.mutate(formData);
  };

  const handleSave = (image: any, tempImage: any) => {
    setImage(image);
    setTempImage(tempImage);
    setImageModalOpen(false);
  };

  const handleLocationSave = (position: [number, number]) => {
    const [latitude, longitude] = position;
    setLocation({ latitude, longitude });
    setLocationModalOpen(false);
  };

  if (isPending) return <Loading />;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-8">
      <h1 className="text-3xl font-bold text-yellow-500 text-center">Hayvan Güncelle</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-8 w-1/2 mx-auto">
        <input
          name="species"
          type="text"
          defaultValue={animal?.species || ""}
          placeholder="Tür"
          className="border border-gray-400 p-2 rounded-md outline-1 outline-yellow-500"
        />
        <input
          name="description"
          type="text"
          defaultValue={animal?.description || ""}
          placeholder="Açıklama"
          className="border border-gray-400 p-2 rounded-md outline-1 outline-yellow-500"
        />
        <Select
          name="gender"
          options={genderOptions}
          defaultValue={genderOptions.find(option => option.value === animal?.gender)}
          className="react-select-container"
        />
        <Select
          name="color"
          options={colorOptions}
          defaultValue={colorOptions.find(option => option.value === animal?.color)}
          className="react-select-container"
        />
        <Select
          name="healthStatus"
          options={healthStatusOptions}
          defaultValue={healthStatusOptions.find(option => option.value === animal?.healthStatus)}
          className="react-select-container"
        />

        <div className="flex gap-4">
          <button
            type="button"
            className="w-1/2 border border-yellow-500 p-2 rounded-md"
            onClick={() => setImageModalOpen(true)}
          >
            Resim Güncelle
          </button>

          <button
            type="button"
            className="w-1/2 border border-yellow-500 p-2 rounded-md"
            onClick={() => setLocationModalOpen(true)}
          >
            Konum Güncelle
          </button>
        </div>

        <img src={`http://localhost:3000/${animal.image}`} alt="" className="w-1/3 mx-auto" />

        {location.latitude && location.longitude && (
          <div className="flex items-center justify-center gap-4">
            <p>Enlem: {location.latitude}</p>
            <p>|</p>
            <p>Boylam: {location.longitude}</p>
          </div>
        )}

        <button disabled={mutation.isPending} className="bg-yellow-500 text-white p-2 rounded-md">
          Güncelle
        </button>
      </form>

      {isImageModalOpen && <ImageUploadModal onClose={() => setImageModalOpen(false)} onSave={handleSave} />}
      {isLocationModalOpen && (
        <LocationModal onClose={() => setLocationModalOpen(false)} onSave={handleLocationSave} />
      )}
    </div>
  );
};

export default UpdateAnimalPage;
