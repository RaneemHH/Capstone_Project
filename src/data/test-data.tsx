// import {User} from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFont, faCheckSquare, faSliders,faMars, faVenus, faTransgender } from '@fortawesome/free-solid-svg-icons'
import {
    CirclePlus,
    // FileInput,
    // Type,
    // Image,
    // Video, Trash,
    Trash2,
    // ClipboardList,
} from "lucide-react"; // Or another icon library like `react-icons`
import { createLucideIcon  } from "lucide-react";
export const genders = [
    {
        value: "FEMALE",
        label: "أنثى",
        icon: () => <FontAwesomeIcon icon={faVenus} className="text-blue-500 w-4 h-4" />,
    },
    {
        value: "MALE",
        label: "ذكر",
        icon: () => <FontAwesomeIcon icon={faMars} className="text-blue-500 w-4 h-4" />,

    },
    {
        value: "ALL",
        label: "كلاهما",
        icon: () => <FontAwesomeIcon icon={faTransgender} className="text-blue-500 w-4 h-4" />,

    },
]
// import {  faListUl, faSquareCheck, faGripLines } from '@fortawesome/free-solid-svg-icons';

export const questionTypes = [
    {
        value: "OPEN",
        label: "نص مفتوح",
        icon: () => <FontAwesomeIcon icon={faFont} className="text-purple-500 w-4 h-4" />,
    },
    {
        value: "SCALE",
        label: "مقياس",
        icon: () => <FontAwesomeIcon icon={faSliders} className="text-green-500 w-4 h-4" />,
    },
    {
        value: "CHECKBOX",
        label: "مربع الاختيار",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
    // {
    //     value: "MULTIPLE_CHOICE",
    //     label: "Multiple Choice",
    //     icon: () => <FontAwesomeIcon icon={faListUl} className="text-orange-500 w-4 h-4" />,
    // },
    // {
    //     value: "DROPDOWN",
    //     label: "Dropdown",
    //     icon: () => <FontAwesomeIcon icon={faGripLines} className="text-teal-500 w-4 h-4" />,
    // },
    // {
    //     value: "SINGLE_CHOICE",
    //     label: "Radio Buttons",
    //     icon: () => <FontAwesomeIcon icon={faSquareCheck} className="text-red-500 w-4 h-4" />,
    // },
];
export const questionTraits = [
    {
        value: "R",
        label: "R",
        icon: () => <FontAwesomeIcon icon={faFont} className="text-purple-500 w-4 h-4" />,
    },
    {
        value: "S",
        label: "S",
        icon: () => <FontAwesomeIcon icon={faSliders} className="text-green-500 w-4 h-4" />,
    },
    {
        value: "I",
        label: "I",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
    {
        value: "E",
        label: "E",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
    {
        value: "A",
        label: "A",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
    {
        value: "C",
        label: "C",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
    {
        value: "ALL",
        label: "ALL",
        icon: () => <FontAwesomeIcon icon={faCheckSquare} className="text-blue-500 w-4 h-4" />,
    },
];
 const StackedRectangles = createLucideIcon("StackedRectangles", [
    ["rect", {key:"rect1", x: "3", y: "4", width: "18", height: "6", rx: "1" }],
    ["rect", {key:"rect2", x: "3", y: "14", width: "18", height: "6", rx: "1" }],
]);

export const icons = [
    { name: "Add Question", value: CirclePlus  },
    {name:"Delete Section",value:Trash2},
    // { name: "Add Text Block", value: FileInput },
    // { name: "Add Title", value: Type },
    // { name: "Add Image", value: Image },
    // { name: "Add Video", value: Video  },
    { name: "Add Section", value: StackedRectangles },
];