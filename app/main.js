const http = require('http'),
    fs = require('fs'),
    url = require('url'),
    {
        parse
    } = require('querystring');

mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

/*
¿Cuál es la principal función del módulo HTTP?
implementar el protocolo HTTP en nuesrto programa que permite una 
mejor eficiencia en las peticiones de las conexiones web.

¿Cuál es la principal función del módulo FileSystem?
permite trabajar con archivos que tengamos en nuestro sistema

¿Qué es un MIME type?
son la manera standard de mandar contenido a través de la red. Los tipos MIME especifican tipos de datos, como por ejemplo 
texto, imagen, audio, etc. que los archivos contienen

¿Qué contienen las variables "req" y "res" en la creación del servidor?
req contiene las peticiones que se hacen al iniciar el servidor
res por el contrario son las respuestas que el cliente manda al servidor

¿La instrucción .listen(number) puede fallar? Justifique.
depende ya que si el puerto al que se esta intentando acceder esta ocupado, este no podra 
acceder a este

¿Por qué es útil la función "collectRequestData(...)"?
porque a traves de esta el servidor reune o colecta todas las peticiones hechas por 
el cliente


¿Para qué, además de conocer la dirección de la petición, es útil la variable "pathname"?
a traves de ella obtenemos el archivo solicitado 

¿Qué contine el parametro "data"?
la request que el cliente esta haciento al servidor, en este caso
el index.html

¿Cuál es la diferencia entre brindar una respuesta HTML y brindar una CSS?
la respuesta HTML envia el archivo .html, es decir la pagina mientras que CSS solo aplica
o envia los estilos al archivo correspondiente

¿Qué contiene la variable "result"?
contiene los datos/valores obtenidos a traves de los diferentes input

¿Por qué con la variable "data" se debe aplicarse el metodo toString()? Justifique.
porque para recibir en formato  string los datos obtenidos en el formulario

¿Hay diferencia al quitar el control de peticiones para hojas CSS? Si sucedió algo distinto justifique por qué.
si porque al no encontrar un archivo css no aplica los estilos

¿Se puede inciar el servidor (node main.js) en cualquier sitio del proyecto? Cualquier respuesta justifique.
No se puede porque al buscar el archivo main.js no se encuentra la ruta

Con sus palabras, ¿Por qué es importante aprender Node.js sin el uso de frameworks a pesar que estos facilitan el manejo de API's?
porque es necesario conocer el funcionamiento para que a la hora de trabajar con frameworks se nos facilite
y asi  podamos tener un mejor rendimiento
*/

http.createServer((req, res) => {
    var pathname = url.parse(req.url).pathname;

    if (pathname == "/") {
        pathname = "../index.html";
    }

    if (pathname == "../index.html") {
        //Peticion de la pagina principal 
        fs.readFile(pathname, (err, data) => {
            if (err) {
                console.log(err);
                // HTTP Status: 404 : NOT FOUND
                // En caso no haberse encontrado el archivo
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                }); return res.end("404 Not Found");
            }
            // Pagina encontrada
            // HTTP Status: 200 : OK

            res.writeHead(200, {
                'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
            });

            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());


            // Envia la respuesta 
            return res.end();
        });
    }

    if(pathname.split(".")[1] == "css"){
          fs.readFile(".."+pathname, (err, data)=>{
        
            if (err) {
              console.log(err);
              res.writeHead(404, {
                'Content-Type': 'text/html'
              });       return res.end("404 Not Found");     }
        
            res.writeHead(200, {
              'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/css'
            });
        
            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());
        
        
            // Envia la respuesta 
            return res.end();
          });
        }

    if (req.method === 'POST' && pathname == "/cv") {
         //Peticion del formulario a traves del metodo POST 
        collectRequestData(req, (err, result) => {

            if (err) {
                res.writeHead(400, {
                    'content-type': 'text/html'
                });
                return res.end('Bad Request');
            }

            fs.readFile("../templates/plantilla.html", function (err, data) {
                if (err) {
                    console.log(err);
                    // HTTP Status: 404 : NOT FOUND
                    // Content Type: text/plain
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    return res.end("404 Not Found");
                }

                res.writeHead(200, {
                    'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
                });

                //Variables de control. 

                let parsedData = data.toString().replace('${dui}', result.dui)
                    .replace("${lastname}", result.lastname)
                    .replace("${firstname}", result.firstname)
                    .replace("${gender}", result.gender)
                    .replace("${civilStatus}", result.civilStatus)
                    .replace("${birth}", result.birth)
                    .replace("${exp}", result.exp)
                    .replace("${tel}", result.tel)
                    .replace("${std}", result.std);

                res.write(parsedData);
                return res.end();
            });

        });
    }

    
}

).listen(8081);

function collectRequestData(request, callback) {

    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
      if (request.headers['content-type'] === FORM_URLENCODED) {
            let body = '';
            // Evento de acumulacion de data. 
            request.on('data', chunk => {
                  body += chunk.toString();
            });
            // Data completamente recibida 
            request.on('end', () => {
                  callback(null, parse(body));
            });
      } else {
            callback({
                  msg: `The content-type don't is equals to ${FORM_URLENCODED}`
            });
      }
}

