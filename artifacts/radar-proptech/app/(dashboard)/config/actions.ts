  "use server";

  import { createClient } from "@/utils/supabase/server";
  import { revalidatePath } from "next/cache";

  export async function updateIdealistaUrl(formData: FormData) {
    const url = formData.get("idealistaUrl") as string;

    // Validación básica: evitar URLs vacías
    if (!url || url.trim() === "") {
      return { error: "La URL no puede estar vacía" };
    }

    const supabase = await createClient();

    // Obtenemos el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "No autenticado" };
    }

    // Buscamos primero el id_agencia del usuario en la tabla 'usuarios'
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("id_agencia")
      .eq("id_usuario", user.id)
      .single();

    if (userError || !userData?.id_agencia) {
      return { error: "No tienes agencia asignada o el usuario no existe" };
    }

    // Guardamos o actualizamos la configuración en 'configuracion_rastreo'
    // Nota: Al usar upsert, si el id_agencia ya tiene una configuración, se actualizará.
    const { error } = await supabase
      .from("configuracion_rastreo")
      .upsert({ 
        id_agencia: userData.id_agencia, 
        url_idealista: url,
        activa: true 
      });

    if (error) {
      console.error("Error al guardar en base de datos:", error);
      return { error: "Error al guardar en base de datos" };
    }

    revalidatePath("/dashboard/config");
    return { success: true };
  }